# Phase 2 — 데이터 레이어 구축

> 날짜: 2026-04-01
> 상태: 완료

## 목표

Supabase DB 스키마를 확정하고, 모든 페이지에서 공통으로 사용할 쿼리 함수와 계산 로직을 완성하여 이후 Phase들이 UI에만 집중할 수 있게 한다.

---

## 주의사항

- 인증 없는 개인 앱이므로 RLS는 비활성화 (전체 허용)
- 계산 함수는 순수 함수로 작성 — 부수효과 없음, DB 호출 없음
- 쿼리 함수는 `{ data, error }` 형태로 통일 (Server Actions 원칙)
- `use context7`로 Supabase, Next.js 최신 패턴 확인 후 작성

---

## Step 1. Supabase SQL 스키마 파일 작성

`supabase/schema.sql` 파일 생성:

```sql
-- profiles 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  height numeric NOT NULL,
  weight numeric NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  goal text NOT NULL CHECK (goal IN ('loss', 'gain', 'maintain')),
  activity_level text NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- workout_logs 테이블
CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  exercise_name text NOT NULL,
  duration_minutes integer NOT NULL,
  intensity text NOT NULL CHECK (intensity IN ('low', 'moderate', 'high')),
  sets integer,
  reps integer,
  weight_kg numeric,
  calories_burned integer NOT NULL,
  met_value numeric NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- diet_logs 테이블
CREATE TABLE IF NOT EXISTS diet_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  meal_time text NOT NULL CHECK (meal_time IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name text NOT NULL,
  calories integer NOT NULL,
  protein_g numeric NOT NULL,
  carbs_g numeric NOT NULL,
  fat_g numeric NOT NULL,
  amount_g numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles updated_at 트리거
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS 비활성화 (개인 앱, 인증 없음)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE diet_logs DISABLE ROW LEVEL SECURITY;
```

> **실행 방법**: Supabase Dashboard → SQL Editor → 위 SQL 붙여넣기 후 Run

---

## Step 2. 계산 로직 작성

`src/lib/calculations/index.ts` 생성:

```ts
import type { Profile } from '@/types'

/** BMR (Mifflin-St Jeor) */
export function calcBMR(profile: Pick<Profile, 'weight' | 'height' | 'age' | 'gender'>): number {
  const base = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age
  return profile.gender === 'male' ? base + 5 : base - 161
}

const ACTIVITY_MULTIPLIER: Record<Profile['activity_level'], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

/** TDEE = BMR × 활동 계수 */
export function calcTDEE(profile: Pick<Profile, 'weight' | 'height' | 'age' | 'gender' | 'activity_level'>): number {
  return Math.round(calcBMR(profile) * ACTIVITY_MULTIPLIER[profile.activity_level])
}

const PROTEIN_MULTIPLIER: Record<Profile['goal'], number> = {
  loss: 2.0,
  gain: 2.2,
  maintain: 1.6,
}

/** 일일 권장 단백질 (g) */
export function calcProteinGoal(profile: Pick<Profile, 'weight' | 'goal'>): number {
  return Math.round(profile.weight * PROTEIN_MULTIPLIER[profile.goal])
}

/** 운동 칼로리 소모 = MET × 체중(kg) × 시간(h) */
export function calcCaloriesBurned(metValue: number, weightKg: number, durationMinutes: number): number {
  return Math.round(metValue * weightKg * (durationMinutes / 60))
}

/** 일일 권장 운동 시간 (분) — 목표별 */
export function calcWorkoutGoalMinutes(goal: Profile['goal']): number {
  if (goal === 'loss') return 60
  if (goal === 'gain') return 45
  return 30
}
```

---

## Step 3. profiles 쿼리 함수

`src/lib/supabase/queries/profiles.ts` 생성:

```ts
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

/** 프로필 조회 (첫 번째 행) */
export async function getProfile(): Promise<{ data: Profile | null; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { data: null, error: error.message }
  }
  return { data: data ?? null, error: null }
}

/** 프로필 생성 또는 업데이트 (id 있으면 update, 없으면 insert) */
export async function upsertProfile(
  profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>,
  id?: string,
): Promise<{ data: Profile | null; error: string | null }> {
  const supabase = await createClient()

  if (id) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', id)
      .select()
      .single()
    return { data: data ?? null, error: error?.message ?? null }
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()
  return { data: data ?? null, error: error?.message ?? null }
}
```

---

## Step 4. workout_logs 쿼리 함수

`src/lib/supabase/queries/workout.ts` 생성:

```ts
import { createClient } from '@/lib/supabase/server'
import type { WorkoutLog } from '@/types'

/** 날짜별 운동 기록 조회 */
export async function getWorkoutLogs(date?: string): Promise<{ data: WorkoutLog[]; error: string | null }> {
  const supabase = await createClient()
  let query = supabase.from('workout_logs').select('*').order('created_at', { ascending: false })
  if (date) query = query.eq('date', date)

  const { data, error } = await query
  return { data: data ?? [], error: error?.message ?? null }
}

/** 운동 기록 추가 */
export async function createWorkoutLog(
  log: Omit<WorkoutLog, 'id' | 'created_at'>,
): Promise<{ data: WorkoutLog | null; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('workout_logs').insert(log).select().single()
  return { data: data ?? null, error: error?.message ?? null }
}

/** 운동 기록 삭제 */
export async function deleteWorkoutLog(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from('workout_logs').delete().eq('id', id)
  return { error: error?.message ?? null }
}
```

---

## Step 5. diet_logs 쿼리 함수

`src/lib/supabase/queries/diet.ts` 생성:

```ts
import { createClient } from '@/lib/supabase/server'
import type { DietLog } from '@/types'

/** 날짜별 식단 기록 조회 */
export async function getDietLogs(date?: string): Promise<{ data: DietLog[]; error: string | null }> {
  const supabase = await createClient()
  let query = supabase.from('diet_logs').select('*').order('created_at', { ascending: false })
  if (date) query = query.eq('date', date)

  const { data, error } = await query
  return { data: data ?? [], error: error?.message ?? null }
}

/** 식단 기록 추가 */
export async function createDietLog(
  log: Omit<DietLog, 'id' | 'created_at'>,
): Promise<{ data: DietLog | null; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('diet_logs').insert(log).select().single()
  return { data: data ?? null, error: error?.message ?? null }
}

/** 식단 기록 삭제 */
export async function deleteDietLog(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from('diet_logs').delete().eq('id', id)
  return { error: error?.message ?? null }
}
```

---

## Step 6. 폴더 구조 확인

작업 완료 후 예상 구조:

```
src/
├── lib/
│   ├── calculations/
│   │   └── index.ts          ← Step 2에서 생성
│   └── supabase/
│       ├── client.ts         (Phase 1에서 생성)
│       ├── server.ts         (Phase 1에서 생성)
│       └── queries/
│           ├── profiles.ts   ← Step 3에서 생성
│           ├── workout.ts    ← Step 4에서 생성
│           └── diet.ts       ← Step 5에서 생성
supabase/
└── schema.sql                ← Step 1에서 생성
```

---

## 완료 조건

- [ ] Supabase Dashboard에서 3개 테이블 생성 확인 (profiles, workout_logs, diet_logs)
- [ ] `src/lib/calculations/index.ts` 타입 에러 없음
- [ ] `src/lib/supabase/queries/` 3개 파일 타입 에러 없음
- [ ] `pnpm tsc --noEmit` 통과
- [ ] `pnpm lint` 통과
- [ ] `pnpm dev` 정상 실행 (기존 유지)

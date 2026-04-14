# Phase 9 — Drizzle ORM 도입

> 날짜: 2026-04-06
> 상태: 완료 (DB push 제외 — Supabase 연결 시 실행)

## 목표

`@supabase/ssr` 직접 쿼리 방식을 Drizzle ORM으로 교체한다. DB 스키마를 코드로 관리하고, 타입을 스키마에서 자동 추론해 수동 타입 관리를 제거한다.

---

## 주의사항

- `use context7`으로 최신 stable 문서 확인 후 작성 (beta / rc 제외)
- `/code-quality` 규칙 준수 — any 타입, 타입 단언 남용, 우회 코드, 더티 로직 금지
- mock 모드(`!process.env.DATABASE_URL`) 유지 — DB 없이도 개발 가능하게
- 쿼리 함수 시그니처 유지 — 페이지/액션 파일 변경 없음
- `@supabase/ssr`, `@supabase/supabase-js` 패키지 제거
- Server Actions는 서버에서만 실행되므로 `DATABASE_URL`은 `NEXT_PUBLIC_` 불필요

---

## Step 1. 패키지 교체

**제거:**
```bash
pnpm remove @supabase/ssr @supabase/supabase-js
```

**설치:**
```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

---

## Step 2. 환경변수 변경

**`.env.local` 교체:**
```
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

- Supabase 대시보드 → **Settings → Database → Connection string → Transaction pooler** 에서 복사
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 제거

**`.env.local.example` 동일하게 수정:**
```
DATABASE_URL=
```

**mock 모드 조건 변경:**
- 기존: `!process.env.NEXT_PUBLIC_SUPABASE_URL`
- 변경: `!process.env.DATABASE_URL`

---

## Step 3. Drizzle 설정 파일

**`drizzle.config.ts`** 루트에 신규 생성:

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

---

## Step 4. DB 연결

**`src/lib/db/index.ts`** 신규 생성:

```ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })
```

---

## Step 5. 스키마 정의

**`src/lib/db/schema.ts`** 신규 생성:

```ts
import { integer, numeric, pgTable, text, timestamp, uuid, date } from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  height: numeric('height').notNull(),
  weight: numeric('weight').notNull(),
  age: integer('age').notNull(),
  gender: text('gender', { enum: ['male', 'female'] }).notNull(),
  goal: text('goal', { enum: ['loss', 'gain', 'maintain'] }).notNull(),
  activity_level: text('activity_level', {
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
  }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const workoutLogs = pgTable('workout_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  exercise_name: text('exercise_name').notNull(),
  duration_minutes: integer('duration_minutes').notNull(),
  intensity: text('intensity', { enum: ['low', 'moderate', 'high'] }).notNull(),
  sets: integer('sets'),
  reps: integer('reps'),
  weight_kg: numeric('weight_kg'),
  calories_burned: integer('calories_burned').notNull(),
  met_value: numeric('met_value').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const dietLogs = pgTable('diet_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  meal_time: text('meal_time', {
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
  }).notNull(),
  food_name: text('food_name').notNull(),
  calories: integer('calories').notNull(),
  protein_g: numeric('protein_g').notNull(),
  carbs_g: numeric('carbs_g').notNull(),
  fat_g: numeric('fat_g').notNull(),
  amount_g: numeric('amount_g'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
```

---

## Step 6. 타입 교체

**`src/types/index.ts`** 를 스키마 추론 타입으로 교체:

```ts
import type { InferSelectModel } from 'drizzle-orm'
import type { dietLogs, profiles, workoutLogs } from '@/lib/db/schema'

export type Goal = 'loss' | 'gain' | 'maintain'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Intensity = 'low' | 'moderate' | 'high'
export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type Profile = InferSelectModel<typeof profiles>
export type WorkoutLog = InferSelectModel<typeof workoutLogs>
export type DietLog = InferSelectModel<typeof dietLogs>
```

---

## Step 7. 쿼리 파일 교체

`src/lib/supabase/` 폴더 전체 삭제 후 `src/lib/db/queries/` 로 교체.

**`src/lib/db/queries/profiles.ts`** 신규 생성:

```ts
import 'server-only'

import { desc } from 'drizzle-orm'

import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { MOCK_PROFILE } from '@/lib/mock/data'
import type { Profile } from '@/types'

type ProfileInput = Omit<Profile, 'id' | 'created_at' | 'updated_at'>

const isMockMode = !process.env.DATABASE_URL

export async function getProfile(): Promise<{ data: Profile | null; error: string | null }> {
  if (isMockMode) return { data: MOCK_PROFILE, error: null }

  try {
    const rows = await db.select().from(profiles).orderBy(desc(profiles.created_at)).limit(1)
    return { data: rows[0] ?? null, error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

export async function upsertProfile(
  profile: ProfileInput,
  id?: string,
): Promise<{ data: Profile | null; error: string | null }> {
  if (isMockMode) {
    return { data: { ...MOCK_PROFILE, ...profile, id: id ?? MOCK_PROFILE.id }, error: null }
  }

  try {
    if (id) {
      const rows = await db
        .update(profiles)
        .set({ ...profile, updated_at: new Date() })
        .where(eq(profiles.id, id))
        .returning()
      return { data: rows[0] ?? null, error: null }
    }

    const rows = await db.insert(profiles).values(profile).returning()
    return { data: rows[0] ?? null, error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}
```

> `eq`는 `drizzle-orm`에서 import. workout/diet 쿼리도 동일 패턴으로 작성.

**`src/lib/db/queries/workout.ts`** 신규 생성:

- `getWorkoutLogs(options?)` — `db.select().from(workoutLogs)` + `where(and(...))` 조건
- `createWorkoutLog(log)` — `db.insert(workoutLogs).values(log).returning()`
- `deleteWorkoutLog(id)` — `db.delete(workoutLogs).where(eq(workoutLogs.id, id))`

**`src/lib/db/queries/diet.ts`** 신규 생성: 동일 패턴

---

## Step 8. import 경로 수정

아래 파일들의 import를 `@/lib/supabase/queries/*` → `@/lib/db/queries/*` 로 교체:

- `src/lib/actions/workout.ts`
- `src/lib/actions/diet.ts`
- `src/lib/actions/profile.ts`

---

## Step 9. DB 생성 및 package.json 스크립트 추가

**`package.json` scripts 추가:**
```json
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio"
```

DB 연결 후:
```bash
pnpm db:push
```
→ 스키마 기반으로 Supabase DB에 테이블 자동 생성

---

## Step 10. 패키지 위치 및 누락 수정 (리뷰 반영)

**`drizzle-orm` dependencies로 이동** (현재 devDependencies에 잘못 위치):
```bash
pnpm remove drizzle-orm
pnpm add drizzle-orm
```

**`dotenv` 설치** (`drizzle.config.ts`의 `import 'dotenv/config'` 때문에 필요):
```bash
pnpm add -D dotenv
```

**`src/lib/supabase/` 빈 폴더 삭제**:
```bash
rm -rf src/lib/supabase
```

**`supabase/schema.sql` 삭제** (Drizzle 스키마로 대체):
```bash
rm -rf supabase/
```

> `updated_at` 자동 갱신 트리거는 DB에서 제거하고 애플리케이션 레벨(`upsertProfile`)에서 처리.
> 상세 방침: `docs/database.md` 참고

---

## 완료 후 예상 폴더 구조

```
src/
├── lib/
│   ├── db/
│   │   ├── index.ts              ← DB 연결
│   │   ├── schema.ts             ← 스키마 (단일 진실 공급원)
│   │   └── queries/
│   │       ├── profiles.ts
│   │       ├── workout.ts
│   │       └── diet.ts
│   ├── actions/                  (import 경로만 수정)
│   ├── calculations/             (변경 없음)
│   └── mock/                     (변경 없음)
├── types/
│   └── index.ts                  ← 스키마 추론 타입으로 교체
drizzle.config.ts                 ← 신규
drizzle/                          ← drizzle-kit 생성 마이그레이션
```

---

## 완료 조건

- [x] `drizzle-orm` dependencies로 이동 확인
- [x] `dotenv` devDependencies 설치 확인
- [x] `src/lib/supabase/` 폴더 완전 삭제 확인
- [x] `supabase/schema.sql` 및 `supabase/` 폴더 삭제 확인
- [ ] `pnpm db:push` 로 Supabase DB 테이블 생성 완료 (Supabase 연결 시 실행)
- [x] mock 모드 정상 동작 (`DATABASE_URL` 없을 때)
- [x] 모든 페이지 정상 동작 (Dashboard, Workout, Diet, Profile, Analysis)
- [x] `@supabase/ssr`, `@supabase/supabase-js` 패키지 제거 확인
- [x] `pnpm tsc --noEmit` 통과
- [x] `pnpm lint` 통과
- [x] `pnpm dev` 정상 실행

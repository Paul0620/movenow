# Phase 7 — Analysis 페이지

> 날짜: 2026-04-04
> 상태: 완료

## 목표

`/analysis` 페이지를 구현한다. 주간(7일) / 월간(30일) 기간 필터로 운동·식단 데이터를 Recharts 차트로 시각화하고, 목표 달성률을 요약한다. 모든 계산은 실시간, DB 저장 없음.

---

## 주의사항

- `use context7`으로 최신 stable 문서 확인 후 작성 (beta / rc 제외)
- `/code-quality` 규칙 준수 — any 타입, 타입 단언 남용, 우회 코드, 더티 로직 금지
- Recharts 컴포넌트는 반드시 `'use client'` — Server Component에서 직접 렌더링 불가
- 기간 필터는 URL searchParams(`?period=week|month`)로 관리 — 페이지는 Server Component 유지
- 계산 함수는 `src/lib/calculations/analysis.ts`에 순수 함수로 분리
- 기존 쿼리 함수(`getWorkoutLogs`, `getDietLogs`) 시그니처 변경 시 기존 호출부도 함께 수정

---

## Step 1. 쿼리 확장

기존 `getWorkoutLogs`, `getDietLogs`가 단일 `date?: string` 파라미터만 지원하므로, 날짜 범위 조회를 위해 옵션 객체 방식으로 변경한다.

**`src/lib/supabase/queries/workout.ts` 수정:**

```ts
type GetWorkoutLogsOptions = {
  date?: string    // 단일 날짜 (YYYY-MM-DD)
  from?: string    // 범위 시작 (YYYY-MM-DD)
  to?: string      // 범위 끝 (YYYY-MM-DD)
}

export async function getWorkoutLogs(
  options?: GetWorkoutLogsOptions,
): Promise<{ data: WorkoutLog[]; error: string | null }>
```

- `date`가 있으면 `.eq('date', date)`
- `from`이 있으면 `.gte('date', from)`
- `to`가 있으면 `.lte('date', to)`
- 기존 호출부 (`src/app/page.tsx`) → `getWorkoutLogs({ date: today })`, `getWorkoutLogs()` 형태로 교체

**`src/lib/supabase/queries/diet.ts` 수정:** 동일한 패턴으로 수정

---

## Step 2. 분석 계산 로직

**`src/lib/calculations/analysis.ts`** 신규 생성:

**타입 정의:**

```ts
export type DailyWorkoutSummary = {
  date: string
  totalMinutes: number
  totalCaloriesBurned: number
}

export type DailyDietSummary = {
  date: string
  totalCalories: number
  totalProteinG: number
}

export type DailyGoalStatus = {
  date: string
  caloriesAchieved: boolean   // 섭취 ≤ TDEE
  proteinAchieved: boolean    // 섭취 ≥ 단백질 목표 × 0.8
  workoutAchieved: boolean    // 운동시간 ≥ 목표 운동시간
}
```

**함수:**

```ts
/** WorkoutLog 배열을 날짜별로 집계 */
export function aggregateWorkoutByDate(logs: WorkoutLog[]): DailyWorkoutSummary[]

/** DietLog 배열을 날짜별로 집계 */
export function aggregateDietByDate(logs: DietLog[]): DailyDietSummary[]

/**
 * 날짜 목록에 대한 일별 목표 달성 여부 계산
 * - workoutSummaries, dietSummaries에 없는 날짜는 0으로 처리
 */
export function calcDailyGoalStatus(
  dates: string[],
  workoutSummaries: DailyWorkoutSummary[],
  dietSummaries: DailyDietSummary[],
  profile: Profile,
): DailyGoalStatus[]
```

계산 기준:
- 칼로리 목표: `calcTDEE(profile)` (섭취 ≤ TDEE)
- 단백질 목표: `calcProteinGoal(profile) × 0.8` 이상
- 운동 목표: `calcWorkoutGoalMinutes(profile.goal)` 이상

---

## Step 3. Analysis 페이지

**`src/app/analysis/page.tsx`** — Server Component:

```ts
type Props = {
  searchParams: Promise<{ period?: string }>
}

export default async function AnalysisPage({ searchParams }: Props)
```

- `period`: `'week'` | `'month'` (기본값: `'week'`)
  - `'week'` → 오늘 기준 최근 7일
  - `'month'` → 오늘 기준 최근 30일
- 날짜 범위 계산 (`from`, `to`) 후 병렬 조회:
  ```ts
  const [profileResult, workoutResult, dietResult] = await Promise.all([
    getProfile(),
    getWorkoutLogs({ from, to }),
    getDietLogs({ from, to }),
  ])
  ```
- Profile 없으면 → `<ProfileMissing />` 반환 (Phase 6에서 만든 컴포넌트 재사용)
- 데이터를 계산 함수로 집계 후 차트 컴포넌트에 props 전달

---

## Step 4. 컴포넌트

### `src/components/analysis/PeriodTabs.tsx` — Client Component

- shadcn/ui `Tabs` 사용
- "주간 (7일)" / "월간 (30일)" 탭
- `useRouter`, `useSearchParams` 사용
- 탭 클릭 시 → `router.push('/analysis?period=week')` 또는 `router.push('/analysis?period=month')`

### `src/components/analysis/CalorieChart.tsx` — Client Component

Recharts `ComposedChart` 사용:

| 요소 | 내용 |
| ---- | ---- |
| Bar | 날짜별 실제 섭취 칼로리 (파란색) |
| ReferenceLine | TDEE 목표 (빨간 점선) |
| x축 | 날짜 (MM/DD 형식) |
| y축 | kcal |

props:
```ts
type Props = {
  data: DailyDietSummary[]
  tdeeGoal: number
  period: 'week' | 'month'
}
```

### `src/components/analysis/ProteinChart.tsx` — Client Component

Recharts `ComposedChart` 사용:

| 요소 | 내용 |
| ---- | ---- |
| Bar | 날짜별 실제 단백질 섭취 (초록색) |
| ReferenceLine | 단백질 목표 (주황 점선) |
| x축 | 날짜 (MM/DD 형식) |
| y축 | g |

props:
```ts
type Props = {
  data: DailyDietSummary[]
  proteinGoal: number
  period: 'week' | 'month'
}
```

### `src/components/analysis/WorkoutChart.tsx` — Client Component

Recharts `ComposedChart` 사용:

| 요소 | 내용 |
| ---- | ---- |
| Bar | 날짜별 실제 운동 시간 (보라색) |
| ReferenceLine | 목표 운동 시간 (빨간 점선) |
| x축 | 날짜 (MM/DD 형식) |
| y축 | 분 |

props:
```ts
type Props = {
  data: DailyWorkoutSummary[]
  workoutGoalMinutes: number
  period: 'week' | 'month'
}
```

### `src/components/analysis/AchievementSummary.tsx` — Server Component

달성 일수 요약 3개 카드:

| 카드 | 내용 |
| ---- | ---- |
| 칼로리 | X / Y일 달성 |
| 단백질 | X / Y일 달성 |
| 운동 | X / Y일 달성 |

props:
```ts
type Props = {
  goalStatuses: DailyGoalStatus[]
  totalDays: number
}
```

---

## 완료 후 예상 폴더 구조

```
src/
├── app/
│   └── analysis/
│       └── page.tsx                         ← Analysis (Server Component)
├── components/
│   └── analysis/
│       ├── PeriodTabs.tsx                   ← 기간 탭 (Client)
│       ├── CalorieChart.tsx                 ← 칼로리 차트 (Client, Recharts)
│       ├── ProteinChart.tsx                 ← 단백질 차트 (Client, Recharts)
│       ├── WorkoutChart.tsx                 ← 운동 차트 (Client, Recharts)
│       └── AchievementSummary.tsx           ← 달성률 요약 (Server)
└── lib/
    ├── calculations/
    │   ├── index.ts                         (기존)
    │   ├── suggestions.ts                   (기존)
    │   └── analysis.ts                      ← 신규
    └── supabase/
        └── queries/
            ├── workout.ts                   (수정)
            └── diet.ts                      (수정)
```

---

## 완료 조건

- [ ] 주간/월간 탭 전환 시 URL searchParams 변경 및 데이터 재조회
- [ ] 칼로리 차트: Bar(섭취) + ReferenceLine(TDEE) 표시
- [ ] 단백질 차트: Bar(섭취) + ReferenceLine(목표) 표시
- [ ] 운동 차트: Bar(시간) + ReferenceLine(목표) 표시
- [ ] 달성 일수 요약 카드 3개 표시
- [ ] Profile 미설정 시 → ProfileMissing 화면 표시
- [ ] 기존 Dashboard(page.tsx) 쿼리 호출 정상 동작 확인
- [ ] `pnpm tsc --noEmit` 통과
- [ ] `pnpm lint` 통과
- [ ] `pnpm dev` 정상 실행

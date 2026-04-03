# Phase 4 — Workout 페이지

> 날짜: 2026-04-01
> 상태: 완료

## 목표

운동 기록을 추가·조회·삭제하는 Workout 페이지를 완성한다. wger API로 운동을 검색하면 MET 값이 자동 입력되고, 칼로리는 `calcCaloriesBurned`로 자동 계산된다.

---

## 주의사항

- Profile이 없으면 칼로리 계산 불가 → 프로필 미설정 시 안내 문구 표시
- wger API는 외부 호출이므로 Server Action 내부에서만 호출 (클라이언트에서 직접 호출 금지)
- `use context7`으로 Next.js Server Actions, fetch 최신 패턴 확인 후 작성
- 운동명 직접 입력도 허용 (API 검색 실패 대비), MET 값도 수동 입력 가능

---

## Step 1. shadcn/ui 컴포넌트 추가

```bash
pnpm dlx shadcn@latest add badge separator
```

---

## Step 2. wger API 유틸 함수

`src/lib/wger.ts` 생성:

```ts
const WGER_BASE = 'https://wger.de/api/v2'

export type WgerExercise = {
  id: number
  name: string
  category: string
}

/** 운동 검색 — 영어 기준 */
export async function searchExercises(term: string): Promise<WgerExercise[]>

/** 운동 상세 조회 — MET 값 포함 */
export async function getExerciseMet(id: number): Promise<number | null>
```

구현 포인트:
- `fetch`에 `{ next: { revalidate: 86400 } }` 옵션 → 하루 캐싱
- 응답 파싱 실패 시 빈 배열 / null 반환 (에러 throw 금지)

---

## Step 3. Workout Server Actions

`src/lib/actions/workout.ts` 생성:

**Zod 스키마:**

```ts
const WorkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exercise_name: z.string().min(1).max(100),
  duration_minutes: z.coerce.number().int().min(1).max(600),
  intensity: z.enum(['low', 'moderate', 'high']),
  met_value: z.coerce.number().min(0.1).max(30),
  sets: z.coerce.number().int().min(1).optional(),
  reps: z.coerce.number().int().min(1).optional(),
  weight_kg: z.coerce.number().min(0).optional(),
  notes: z.string().max(500).optional(),
})
```

**Server Actions:**

```ts
// 운동 기록 추가
export async function createWorkoutAction(
  prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null; success: boolean }>

// 운동 기록 삭제
export async function deleteWorkoutAction(id: string): Promise<{ error: string | null }>
```

`createWorkoutAction` 처리 순서:
1. Zod 파싱
2. `getProfile()`로 체중 조회
3. `calcCaloriesBurned(met_value, weight_kg, duration_minutes)`로 칼로리 계산
4. `createWorkoutLog()` 호출
5. `revalidatePath('/workout')`

---

## Step 4. 운동 검색 Server Action

`src/lib/actions/wger.ts` 생성:

```ts
'use server'

export async function searchExercisesAction(term: string): Promise<WgerExercise[]>
export async function getExerciseMetAction(id: number): Promise<number | null>
```

클라이언트 컴포넌트에서 검색어 입력 → 이 Action 호출.

---

## Step 5. Workout 페이지

`src/app/workout/page.tsx` — Server Component:
- 오늘 날짜 기준 `getWorkoutLogs(today)` 조회
- `getProfile()` 조회 (칼로리 계산용)
- `<WorkoutList>`, `<WorkoutForm>` 전달

---

## Step 6. Workout 컴포넌트

**`src/components/workout/WorkoutForm.tsx`** — `'use client'`:
- 운동명 텍스트 입력 + 검색 버튼
- 검색 결과 드롭다운 → 선택 시 운동명·MET 자동 입력
- 필드: 날짜, 운동명, 시간(분), 강도, MET, 세트·횟수·무게(선택), 메모(선택)
- 저장 시 `createWorkoutAction` 호출

**`src/components/workout/WorkoutList.tsx`** — Server Component:
- 당일 운동 목록 표시
- 각 항목: 운동명 / 시간 / 칼로리 / 강도 Badge
- 삭제 버튼 → `deleteWorkoutAction` 호출

**`src/components/workout/WorkoutCard.tsx`** — Server Component:
- 단일 운동 기록 카드 UI

---

## 완료 후 예상 폴더 구조

```
src/
├── app/
│   └── workout/page.tsx
├── components/
│   └── workout/
│       ├── WorkoutForm.tsx
│       ├── WorkoutList.tsx
│       └── WorkoutCard.tsx
└── lib/
    ├── wger.ts
    └── actions/
        ├── workout.ts
        └── wger.ts
```

---

## 완료 조건

- [ ] 운동 검색 → 운동명·MET 자동 입력 동작
- [ ] 운동명 직접 입력 + MET 수동 입력도 가능
- [ ] 저장 시 칼로리 자동 계산 후 DB 저장
- [ ] 당일 운동 목록 표시
- [ ] 삭제 동작
- [ ] Profile 미설정 시 안내 문구 표시
- [ ] `pnpm tsc --noEmit` 통과
- [ ] `pnpm lint` 통과
- [ ] `pnpm dev` 정상 실행

# Phase 10 — 컴포넌트 리팩토링

> 날짜: 2026-04-25
> 상태: 완료

## 목표

150줄 초과 컴포넌트 5개를 분리하고, 코드베이스 전반의 중복 패턴을 공통화하여 유지보수성을 높인다.

---

## 주의사항

- `use context7`으로 최신 stable 문서 확인 후 작성 (beta / rc 제외)
- `/code-quality` 규칙 준수 — any 타입, 타입 단언 남용, 우회 코드, 더티 로직 금지
- `/typescript-strict` 규칙 준수 — InferSelectModel 추론, Zod v4 패턴, unknown 에러 처리
- `/react-components` 규칙 준수 — useActionState from 'react', Props type, 라벨 맵 모듈 수준
- `/nextjs-app-router` 규칙 준수 — Server Component 기본, Promise.all 병렬 페칭
- `/styling` 규칙 준수 — shadcn 토큰, 인라인 스타일 금지, 표준 wrapper
- **기존 동작을 변경하지 않는다** — 리팩토링이므로 UI/기능은 그대로 유지
- **페이지/액션 파일은 수정하지 않는다** — 컴포넌트 내부만 분리
- 분리 후 `pnpm tsc --noEmit`, `pnpm lint`, `pnpm dev` 필수 확인

---

## 대상 파일 (150줄 초과)

| 파일 | 줄 수 |
| ---- | ----- |
| `src/components/diet/DietForm.tsx` | 260줄 |
| `src/components/profile/ProfileForm.tsx` | 233줄 |
| `src/components/workout/WorkoutForm.tsx` | 215줄 |
| `src/components/workout/ExerciseSearch.tsx` | 167줄 |
| `src/components/diet/FoodSearch.tsx` | 163줄 |

---

## Step 1. FieldError 공통 컴포넌트 추출

현재 `DietForm`, `WorkoutForm`, `ProfileForm` 각각에 동일한 `FieldError` 컴포넌트가 정의되어 있다. 공통 컴포넌트로 추출한다.

**`src/components/form/FieldError.tsx`** 신규 생성:

```tsx
type FieldErrorProps = {
  message?: string
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null
  return <p className="text-sm text-destructive">{message}</p>
}
```

`DietForm.tsx`, `WorkoutForm.tsx`, `ProfileForm.tsx`의 인라인 `FieldError` 함수를 제거하고 위 컴포넌트를 import한다.

---

## Step 2. WorkoutForm 분리

**현재 구조 (215줄):**
- 운동 검색 섹션 (ExerciseSearch 연동)
- 필드 입력 섹션 (date, exercise_name, duration_minutes, intensity, met_value, sets, reps, weight_kg, notes)
- 제출 버튼

**분리 후 구조:**

`src/components/workout/WorkoutFields.tsx` 신규 생성:
- `sets`, `reps`, `weight_kg`, `notes` 옵셔널 필드 그룹을 담당
- Props: `errors: WorkoutFieldErrors`

```tsx
'use client'

import { FieldError } from '@/components/form/FieldError'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateWorkoutState } from '@/lib/actions/workout'

type WorkoutFieldsProps = {
  errors: CreateWorkoutState['errors']
}

export function WorkoutFields({ errors }: WorkoutFieldsProps) {
  // sets, reps, weight_kg, notes 필드 렌더링
}
```

`WorkoutForm.tsx`에서 `WorkoutFields`를 import하여 사용한다.

---

## Step 3. DietForm 분리

**현재 구조 (260줄):**
- 음식 검색 섹션 (FoodSearch 연동)
- 영양소 입력 필드 (calories, protein_g, carbs_g, fat_g, amount_g)
- 미리보기 카드 (검색 결과 선택 시 영양소 자동 계산)
- 제출 버튼

**분리 후 구조:**

`src/components/diet/MacroPreview.tsx` 신규 생성:
- 음식 검색 후 amount_g 입력 시 영양소 미리보기를 담당
- Props: `food`, `amountG`

```tsx
type MacroPreviewProps = {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export function MacroPreview({ calories, proteinG, carbsG, fatG }: MacroPreviewProps) {
  // 미리보기 카드 렌더링
}
```

`DietForm.tsx`에서 미리보기 계산 후 `MacroPreview`에 props로 전달한다.

---

## Step 4. ProfileForm 분리

**현재 구조 (233줄):**
- 신체 정보 입력 필드 (height, weight, age, gender, goal, activity_level)
- 계산 결과 표시 (BMR, TDEE, 단백질 목표, 운동 시간 목표)

**분리 후 구조:**

`src/components/profile/ProfileStats.tsx` 신규 생성:
- 프로필 기반 계산 결과 표시를 담당
- Props: `profile`

```tsx
import { calcBMR, calcProteinGoal, calcTDEE, calcWorkoutGoalMinutes } from '@/lib/calculations'
import type { Profile } from '@/types'

type ProfileStatsProps = {
  profile: Profile
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  const bmr = calcBMR(profile)
  const tdee = calcTDEE(profile)
  const proteinGoal = calcProteinGoal(profile)
  const workoutGoal = calcWorkoutGoalMinutes(profile.goal)
  // 계산 결과 카드 렌더링
}
```

`ProfileForm.tsx`에서 저장 성공 후 `ProfileStats`를 렌더링한다.

---

## Step 5. FoodSearch / ExerciseSearch 분리

두 컴포넌트는 검색 결과 드롭다운 UI가 동일한 패턴으로 반복된다.

`src/components/form/SearchDropdown.tsx` 신규 생성:
- 검색 결과 목록 렌더링만 담당
- `FoodSearch`, `ExerciseSearch`에서 재사용

```tsx
type SearchDropdownProps<T> = {
  results: T[]
  isOpen: boolean
  renderItem: (item: T) => React.ReactNode
  dropdownRef: React.RefObject<HTMLDivElement>
}

export function SearchDropdown<T>({ results, isOpen, renderItem, dropdownRef }: SearchDropdownProps<T>) {
  if (!isOpen || results.length === 0) return null
  return (
    <div ref={dropdownRef} className="...">
      {results.map((item, index) => (
        <div key={index}>{renderItem(item)}</div>
      ))}
    </div>
  )
}
```

`FoodSearch.tsx`, `ExerciseSearch.tsx`에서 `SearchDropdown`을 import하여 사용한다.

---

## 완료 조건

- [x] `src/components/form/FieldError.tsx` 생성 및 3개 폼에 적용
- [x] `src/components/workout/WorkoutFields.tsx` 생성 및 `WorkoutForm.tsx` 150줄 이하로 축소
- [x] `src/components/diet/MacroPreview.tsx` 생성 및 `DietForm.tsx` 150줄 이하로 축소
- [x] `src/components/profile/ProfileStats.tsx` 생성 및 `ProfileForm.tsx` 150줄 이하로 축소
- [x] `src/components/form/SearchDropdown.tsx` 생성 및 `FoodSearch.tsx`, `ExerciseSearch.tsx` 150줄 이하로 축소
- [x] 기존 동작 변경 없음 (UI/기능 동일)
- [x] `pnpm tsc --noEmit` 통과
- [x] `pnpm lint` 통과
- [x] `pnpm dev` 정상 실행

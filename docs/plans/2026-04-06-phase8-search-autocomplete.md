# Phase 8 — 음식/운동 검색 자동완성 (Open Food Facts + wger)

> 날짜: 2026-04-06
> 상태: 완료

## 목표

DietForm과 WorkoutForm에 외부 API 검색 자동완성을 추가해, 음식명/운동명 입력 시 영양정보와 MET 값을 자동으로 채운다. Supabase 연결 없이 mock 모드에서 완전 동작.

---

## 주의사항

- `use context7`으로 최신 stable 문서 확인 후 작성 (beta / rc 제외)
- `/code-quality` 규칙 준수 — any 타입, 타입 단언 남용, 우회 코드, 더티 로직 금지
- 검색 컴포넌트는 반드시 `'use client'` — debounce + 상태 관리 필요
- Route Handler는 외부 API 프록시 역할 — 에러 시 빈 배열 반환, 앱 크래시 없음
- 기존 DietForm/WorkoutForm의 수동 입력 가능 유지 — 검색 실패해도 직접 입력 가능
- Open Food Facts / wger는 무료 공개 API, API Key 불필요

---

## Step 1. Food Search Route Handler

**`src/app/api/food-search/route.ts`** 신규 생성

- `GET /api/food-search?q=검색어`
- Open Food Facts 호출:
  ```
  GET https://world.openfoodfacts.org/cgi/search.pl
    ?search_terms={q}&json=true&fields=product_name,nutriments&page_size=5
  ```
- 응답 파싱 후 반환 타입:

```ts
type FoodResult = {
  name: string
  calories: number   // nutriments['energy-kcal_100g'], 없으면 0
  proteinG: number   // nutriments['proteins_100g']
  carbsG: number     // nutriments['carbohydrates_100g']
  fatG: number       // nutriments['fat_100g']
}
```

- `q`가 빈 문자열이면 즉시 `{ results: [] }` 반환
- 외부 API fetch 에러 시 `{ results: [] }` 반환 (앱 크래시 방지)
- 반환값은 100g 기준 — `amount_g` 비율 계산은 기존 `createDietAction`이 처리

---

## Step 2. Exercise Search Route Handler

**`src/app/api/exercise-search/route.ts`** 신규 생성

- `GET /api/exercise-search?q=검색어`
- wger 호출:
  ```
  GET https://wger.de/api/v2/exercise/search/?term={q}&language=english&format=json
  ```
- 카테고리별 기본 MET 매핑:

```ts
const MET_BY_CATEGORY: Record<string, number> = {
  Abs: 5.0,
  Arms: 5.0,
  Back: 5.0,
  Calves: 5.0,
  Cardio: 7.5,
  Chest: 5.0,
  Legs: 5.5,
  Shoulders: 5.0,
}
const DEFAULT_MET = 5.0
```

- 응답 파싱 후 반환 타입:

```ts
type ExerciseResult = {
  name: string
  metValue: number
}
```

- `q`가 빈 문자열이면 즉시 `{ results: [] }` 반환
- 외부 API fetch 에러 시 `{ results: [] }` 반환

---

## Step 3. FoodSearch 컴포넌트

**`src/components/diet/FoodSearch.tsx`** — Client Component 신규 생성

```ts
type FoodResult = {
  name: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

type Props = {
  onSelect: (food: FoodResult) => void
  defaultValue?: string
}
```

동작:
- `<input>` 검색어 입력 → 300ms debounce 후 `/api/food-search?q=` 호출
- 결과 드롭다운 표시 (최대 5개)
- 항목 클릭 → `onSelect(food)` 호출 후 드롭다운 닫힘
- 결과 없으면 "검색 결과가 없습니다" 텍스트 표시
- 로딩 중 input 우측에 스피너 표시
- input 외부 클릭 시 드롭다운 닫힘

---

## Step 4. ExerciseSearch 컴포넌트

**`src/components/workout/ExerciseSearch.tsx`** — Client Component 신규 생성

```ts
type ExerciseResult = {
  name: string
  metValue: number
}

type Props = {
  onSelect: (exercise: ExerciseResult) => void
  defaultValue?: string
}
```

동작: FoodSearch와 동일 패턴, `/api/exercise-search?q=` 호출

---

## Step 5. DietForm 수정

**`src/components/diet/DietForm.tsx`** 수정:

- 컴포넌트를 `'use client'`로 전환 (이미 되어있다면 유지)
- `food_name` 텍스트 input → `<FoodSearch>` 컴포넌트로 교체
- 폼 필드를 `useState`로 관리:

```ts
const [fields, setFields] = useState({
  food_name: '',
  calories: '',
  protein_g: '',
  carbs_g: '',
  fat_g: '',
})
```

- `FoodSearch.onSelect` 콜백:
  ```ts
  (food) => setFields({
    food_name: food.name,
    calories: String(food.calories),
    protein_g: String(food.proteinG),
    carbs_g: String(food.carbsG),
    fat_g: String(food.fatG),
  })
  ```
- 자동 채워진 필드도 수동 수정 가능 (읽기 전용 아님)
- hidden input 또는 value 바인딩으로 `createDietAction` Server Action에 전달
- 기존 Server Action 시그니처 변경 없음

---

## Step 6. WorkoutForm 수정

**`src/components/workout/WorkoutForm.tsx`** 수정:

- `exercise_name` 텍스트 input → `<ExerciseSearch>` 컴포넌트로 교체
- 폼 필드 `useState` 추가:

```ts
const [exerciseName, setExerciseName] = useState('')
const [metValue, setMetValue] = useState('')
```

- `ExerciseSearch.onSelect` 콜백:
  ```ts
  (exercise) => {
    setExerciseName(exercise.name)
    setMetValue(String(exercise.metValue))
  }
  ```
- hidden input 또는 value 바인딩으로 기존 Server Action에 전달
- 기존 Server Action 시그니처 변경 없음

---

## 완료 후 예상 폴더 구조

```
src/
├── app/
│   └── api/
│       ├── food-search/
│       │   └── route.ts           ← Open Food Facts 프록시
│       └── exercise-search/
│           └── route.ts           ← wger 프록시
├── components/
│   ├── diet/
│   │   ├── DietForm.tsx           (수정)
│   │   ├── DietList.tsx           (기존)
│   │   └── FoodSearch.tsx         ← 신규
│   └── workout/
│       ├── WorkoutForm.tsx        (수정)
│       ├── WorkoutList.tsx        (기존)
│       └── ExerciseSearch.tsx     ← 신규
```

---

## 완료 조건

- [ ] `/diet` 페이지에서 음식 검색 시 드롭다운 표시 및 자동완성
- [ ] 음식 선택 시 칼로리/단백질/탄수화물/지방 자동 입력
- [ ] `/workout` 페이지에서 운동 검색 시 드롭다운 표시 및 자동완성
- [ ] 운동 선택 시 운동명/MET 자동 입력
- [ ] 검색 실패 / 네트워크 에러 시 앱 크래시 없음
- [ ] 기존 수동 입력 방식 유지 (검색 없이도 폼 제출 가능)
- [ ] `pnpm tsc --noEmit` 통과
- [ ] `pnpm lint` 통과
- [ ] `pnpm dev` 정상 실행

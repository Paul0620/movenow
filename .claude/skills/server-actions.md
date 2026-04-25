---
name: server-actions
description: Next.js Server Action 작성 규칙. 계획 작성 시 주의사항 생성, 리뷰 시 위반 체크에 사용한다.
trigger: /server-actions
---

You are now in **server-actions mode**.

Server Action 작성 규칙을 계획에 반영하고, 구현 결과물을 아래 기준으로 심사한다.

---

## 계획 작성 시 — `## 주의사항`에 추가

```
- 파일 최상단 `'use server'` 선언 필수
- create/update action 시그니처: `(prevState: State, formData: FormData): Promise<State>`
- 모든 FormData 입력값은 Zod `safeParse`로 검증. `parse()` 금지
- 검증 실패 시 `z.flattenError`로 필드별 에러 추출
- 반환 타입: `{ error: string | null; success: boolean; errors: FieldErrors }`
- 처리 순서: Zod 검증 → 의존 데이터 조회 → DB 쓰기 → revalidatePath → 성공 반환
- `revalidatePath`는 DB 쓰기 성공 후에만 호출
- `redirect()` 사용 금지
- `console.log` 잔존 금지
- `/server-actions` 규칙 준수
```

---

## 리뷰 체크리스트

아래 항목 위반 시 해당 Phase 통과 불가:

- [ ] 파일 최상단에 `'use server'`가 선언되어 있는가
- [ ] create/update action이 `(prevState, formData)` 시그니처를 따르는가
- [ ] `Schema.parse()` 대신 `safeParse()`를 사용하는가
- [ ] 검증 실패 시 `z.flattenError`로 필드별 에러를 추출하는가
- [ ] State 타입(`CreateXxxState`)이 export되어 있는가
- [ ] `revalidatePath`가 성공 반환 직전에만 호출되는가
- [ ] `redirect()`를 사용하지 않는가
- [ ] `console.log`가 남아있지 않은가

---

## 규칙 상세

### 1. 파일 구조

```ts
'use server'  // 반드시 파일 최상단

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getProfile } from '@/lib/db/queries/profiles'
import { createWorkoutLog } from '@/lib/db/queries/workout'
```

### 2. State 타입 정의

```ts
type WorkoutFieldErrors = Partial<Record<
  'date' | 'exercise_name' | 'duration_minutes' | 'intensity' | 'met_value' |
  'sets' | 'reps' | 'weight_kg' | 'notes',
  string
>>

export type CreateWorkoutState = {
  error: string | null
  success: boolean
  errors: WorkoutFieldErrors
}
```

### 3. Zod Schema

```ts
const optionalInt = z.preprocess((value) => {
  if (value === '' || value === null) return undefined
  return value
}, z.coerce.number().int().min(1).optional())

const optionalString = z.preprocess((value) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}, z.string().max(500).optional())

const WorkoutSchema = z.object({
  date:             z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exercise_name:    z.string().trim().min(1).max(100),
  duration_minutes: z.coerce.number().int().min(1).max(600),
  intensity:        z.enum(['low', 'moderate', 'high']),
  met_value:        z.coerce.number().min(0.1).max(30),
  sets:             optionalInt,
  reps:             optionalInt,
  weight_kg:        z.preprocess((v) => (v === '' || v === null ? undefined : v), z.coerce.number().min(0).optional()),
  notes:            optionalString,
})
```

### 4. Action 처리 순서

```ts
export async function createWorkoutAction(
  prevState: CreateWorkoutState,
  formData: FormData,
): Promise<CreateWorkoutState> {

  // 1️⃣ Zod 검증
  const parsed = WorkoutSchema.safeParse({
    date: formData.get('date'),
    exercise_name: formData.get('exercise_name'),
    // ...모든 필드 명시
  })

  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors
    return {
      error: '입력값을 다시 확인해주세요.',
      success: false,
      errors: {
        date:          fieldErrors.date?.[0],
        exercise_name: fieldErrors.exercise_name?.[0],
        // ...모든 필드 매핑
      },
    }
  }

  // 2️⃣ 의존 데이터 조회
  const profileResult = await getProfile()
  if (profileResult.error) return { error: profileResult.error, success: false, errors: {} }
  if (!profileResult.data) return { error: '프로필을 먼저 저장해주세요.', success: false, errors: {} }

  // 3️⃣ DB 쓰기
  const result = await createWorkoutLog({ ...parsed.data, calories_burned: ... })
  if (result.error) return { error: result.error, success: false, errors: {} }

  // 4️⃣ 캐시 무효화 (성공 후에만)
  revalidatePath('/workout')
  revalidatePath('/')

  // 5️⃣ 성공 반환
  return { error: null, success: true, errors: {} }
}
```

### 5. delete Action

```ts
export async function deleteWorkoutAction(id: string): Promise<{ error: string | null }> {
  const result = await deleteWorkoutLog(id)
  if (result.error) return { error: result.error }
  revalidatePath('/workout')
  revalidatePath('/')
  return { error: null }
}
```

### 6. 금지 사항

```ts
// ❌ redirect() — UX 단절
import { redirect } from 'next/navigation'
redirect('/workout')

// ❌ parse() — 예외 throw
const data = Schema.parse(formData)

// ❌ Zod 없이 직접 단언
const name = formData.get('name') as string

// ❌ console.log 잔존
console.log('parsed:', parsed.data)
```

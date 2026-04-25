---
name: typescript-strict
description: TypeScript 엄격 타입 규칙. 계획 작성 시 주의사항 생성, 리뷰 시 위반 체크에 사용한다.
trigger: /typescript-strict
---

You are now in **typescript-strict mode**.

TypeScript(v5.x) + Zod(v4.x) 타입 규칙을 계획에 반영하고, 구현 결과물을 아래 기준으로 심사한다.

---

## 계획 작성 시 — `## 주의사항`에 추가

```
- 타입은 `InferSelectModel`로 스키마에서 추론. 수동 타입 정의 금지
- Input 타입은 `Omit<T, 'id' | 'created_at'>` 으로 파생
- `any` 타입 금지 — `unknown` + 타입 가드로 대체
- 타입 단언(`as`) 금지 — Zod `safeParse` 결과를 활용
- `catch` 블록 에러는 `toErrorMessage(error: unknown)` 헬퍼로 처리
- FormData 숫자 필드는 `z.coerce.number()` 사용
- 옵셔널 필드는 `z.preprocess`로 빈 문자열 → `undefined` 변환
- 필드별 에러 추출은 `z.flattenError(parsed.error).fieldErrors` 사용
- `enum` 금지 — 리터럴 유니온 타입으로 대체
- `/typescript-strict` 규칙 준수
```

---

## 리뷰 체크리스트

아래 항목 위반 시 해당 Phase 통과 불가:

- [ ] `any` 타입이 사용되지 않는가 (`as any`, `: any`, `[] as any[]` 포함)
- [ ] 근거 없는 타입 단언(`as SomeType`)이 없는가
- [ ] `catch (error)` 블록에서 `error.message` 직접 접근이 없는가
- [ ] 수동 타입 정의 대신 `InferSelectModel` 추론을 사용하는가
- [ ] FormData 숫자 필드에 `z.coerce`를 사용하는가
- [ ] 옵셔널 필드에 `z.preprocess`로 빈 문자열 처리를 하는가
- [ ] `enum`을 사용하지 않는가

---

## 규칙 상세

### 1. 타입 정의 — 스키마 추론

```ts
// ✅ src/types/index.ts
import type { InferSelectModel } from 'drizzle-orm'
import type { profiles, workoutLogs, dietLogs } from '@/lib/db/schema'

export type Profile    = InferSelectModel<typeof profiles>
export type WorkoutLog = InferSelectModel<typeof workoutLogs>
export type DietLog    = InferSelectModel<typeof dietLogs>

// 리터럴 유니온 타입
export type Goal      = 'loss' | 'gain' | 'maintain'
export type Intensity = 'low' | 'moderate' | 'high'
export type MealTime  = 'breakfast' | 'lunch' | 'dinner' | 'snack'

// ❌ 금지 — 수동 정의
type Profile = { id: string; height: number; ... }

// ❌ 금지 — enum
enum Goal { Loss = 'loss', ... }
```

### 2. Input 타입

```ts
// ✅ Omit으로 파생
type ProfileInput    = Omit<Profile, 'id' | 'created_at' | 'updated_at'>
type WorkoutLogInput = Omit<WorkoutLog, 'id' | 'created_at'>

// ❌ 금지 — 별도 수동 작성
type CreateProfileInput = { height: number; weight: number; ... }
```

### 3. Zod v4 패턴

```ts
// z.coerce — FormData 문자열 → 숫자 변환
duration_minutes: z.coerce.number().int().min(1).max(600),
met_value:        z.coerce.number().min(0.1).max(30),

// z.preprocess — 빈 문자열 → undefined
const optionalInt = z.preprocess((value) => {
  if (value === '' || value === null) return undefined
  return value
}, z.coerce.number().int().min(1).optional())

const optionalString = z.preprocess((value) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}, z.string().max(500).optional())

// z.flattenError — 필드별 에러 추출
const fieldErrors = z.flattenError(parsed.error).fieldErrors
return {
  errors: {
    date:          fieldErrors.date?.[0],
    exercise_name: fieldErrors.exercise_name?.[0],
  }
}

// safeParse — 예외 없이 결과 객체 반환
const parsed = Schema.safeParse({ ... })
if (!parsed.success) { ... }  // parsed.error
parsed.data  // 검증된 데이터

// ❌ 금지 — parse (예외 throw)
const data = Schema.parse({ ... })
```

### 4. unknown 에러 처리

```ts
// ✅ toErrorMessage 헬퍼
function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
}

try { ... } catch (error) {
  return { data: null, error: toErrorMessage(error) }
}

// ❌ 금지
} catch (error: any) { return { error: error.message } }
} catch (error) { return { error: (error as Error).message } }
```

### 5. any / 타입 단언 금지

```ts
// ❌ 금지
const data: any = response
const name = formData.get('name') as string
const items = [] as any[]

// ✅ 대신
const data: unknown = response
const parsed = Schema.safeParse({ name: formData.get('name') })
const items: string[] = []
```

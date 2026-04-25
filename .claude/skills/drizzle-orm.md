---
name: drizzle-orm
description: Drizzle ORM 쿼리 규칙. 계획 작성 시 주의사항 생성, 리뷰 시 위반 체크에 사용한다.
trigger: /drizzle-orm
---

You are now in **drizzle-orm mode**.

Drizzle ORM(v0.45.x) 쿼리 규칙을 계획에 반영하고, 구현 결과물을 아래 기준으로 심사한다.

---

## 계획 작성 시 — `## 주의사항`에 추가

```
- 스키마는 `src/lib/db/schema.ts` 한 파일에만 정의. 분산 금지
- DB 접근은 `getDb()`를 통해서만. 외부에서 `drizzle()` 직접 호출 금지
- 쿼리 함수는 `src/lib/db/queries/[entity].ts`에만 위치
- 반환 타입: 단건 `{ data: T | null; error: string | null }`, 목록 `{ data: T[]; error: string | null }`, 삭제 `{ error: string | null }`
- mock 분기(`if (isMockMode)`)는 함수 최상단 한 줄로만 처리
- 에러는 `toErrorMessage(error: unknown)` 헬퍼로 처리
- 스키마 수정 시 `pnpm db:push` 실행 후 mock 데이터 동기화
- `/drizzle-orm` 규칙 준수
```

---

## 리뷰 체크리스트

아래 항목 위반 시 해당 Phase 통과 불가:

- [ ] 스키마 정의가 `schema.ts` 외 다른 파일에 없는가
- [ ] `getDb()` 없이 `drizzle()` 직접 호출하고 있지 않은가
- [ ] 쿼리 함수 반환 타입이 `{ data, error }` 형식을 따르는가
- [ ] mock 분기가 함수 중간에 삽입되어 있지 않은가
- [ ] `catch` 블록에서 `toErrorMessage(error)` 없이 에러를 직접 사용하고 있지 않은가
- [ ] raw SQL(`db.execute(sql\`...\`)`)을 사용하고 있지 않은가
- [ ] 쿼리 함수 파일 상단에 `import 'server-only'`가 있는가

---

## 규칙 상세

### 1. 쿼리 함수 표준 패턴

```ts
import 'server-only'
import { desc, eq, and, gte, lte } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { workoutLogs } from '@/lib/db/schema'
import { MOCK_WORKOUT_LOGS } from '@/lib/mock/data'
import type { WorkoutLog } from '@/types'

type WorkoutLogInput = Omit<WorkoutLog, 'id' | 'created_at'>
type GetOptions = { date?: string; from?: string; to?: string }

const isMockMode = !process.env.DATABASE_URL

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
}
```

### 2. SELECT

```ts
// 단건
const rows = await getDb().select().from(profiles).orderBy(desc(profiles.created_at)).limit(1)
return { data: rows[0] ?? null, error: null }

// 목록 + 필터
const filters = buildFilters(options)
const rows = filters.length > 0
  ? await getDb().select().from(workoutLogs).where(and(...filters)).orderBy(desc(workoutLogs.created_at))
  : await getDb().select().from(workoutLogs).orderBy(desc(workoutLogs.created_at))
return { data: rows, error: null }
```

### 3. INSERT / UPDATE / DELETE

```ts
// INSERT
const rows = await getDb().insert(workoutLogs).values(log).returning()
return { data: rows[0] ?? null, error: null }

// UPDATE
const rows = await getDb().update(profiles).set({ ...profile, updated_at: new Date().toISOString() }).where(eq(profiles.id, id)).returning()
return { data: rows[0] ?? null, error: null }

// DELETE
await getDb().delete(workoutLogs).where(eq(workoutLogs.id, id))
return { error: null }
```

### 4. 날짜 범위 필터 패턴

```ts
function buildFilters(options?: GetOptions) {
  const filters = []
  if (options?.date) filters.push(eq(workoutLogs.date, options.date))
  if (options?.from) filters.push(gte(workoutLogs.date, options.from))
  if (options?.to)   filters.push(lte(workoutLogs.date, options.to))
  return filters
}
```

### 5. mock 모드 분기

```ts
// ✅ 함수 최상단 한 줄
export async function getWorkoutLogs(options?: GetOptions) {
  if (isMockMode) {
    let logs = MOCK_WORKOUT_LOGS
    if (options?.date) logs = logs.filter(l => l.date === options.date)
    return { data: logs, error: null }
  }
  try { ... } catch (error) { return { data: [], error: toErrorMessage(error) } }
}

// ❌ 금지 — 함수 중간 분기
export async function getWorkoutLogs() {
  const db = getDb()
  if (isMockMode) return { data: MOCK_WORKOUT_LOGS, error: null }  // 중간 삽입 금지
}
```

### 6. 금지 사항

```ts
// ❌ raw SQL
await db.execute(sql`SELECT * FROM profiles`)

// ❌ schema.ts 외부 pgTable 정의
const myTable = pgTable('my_table', { ... })

// ❌ getDb() 없이 직접 생성
const db = drizzle(client)
```

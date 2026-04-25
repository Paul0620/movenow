---
name: react-components
description: React 19 컴포넌트 작성 규칙. 계획 작성 시 주의사항 생성, 리뷰 시 위반 체크에 사용한다.
trigger: /react-components
---

You are now in **react-components mode**.

React 19 컴포넌트 규칙을 계획에 반영하고, 구현 결과물을 아래 기준으로 심사한다.

---

## 계획 작성 시 — `## 주의사항`에 추가

```
- Props 타입은 `type 컴포넌트명Props`로 정의. `interface` 금지
- `useActionState`는 `react` 패키지에서 import (`react-dom` 아님)
- `useActionState` 반환값 순서: `[state, formAction, pending]`
- 라벨 맵 상수(`intensityLabel` 등)는 컴포넌트 함수 외부(모듈 수준)에 정의
- 조건부 렌더링에서 배열 길이 체크는 `items.length > 0 &&` 사용 (0 렌더링 방지)
- 컴포넌트 150줄 초과 시 반드시 분리
- shadcn 컴포넌트 소스 직접 수정 금지. `className` prop으로 커스터마이징
- `/react-components` 규칙 준수
```

---

## 리뷰 체크리스트

아래 항목 위반 시 해당 Phase 통과 불가:

- [ ] Props 타입이 `type`으로 정의되어 있는가 (`interface` 사용하지 않았는가)
- [ ] `useActionState`를 `react`에서 import하는가
- [ ] 라벨 맵 상수가 컴포넌트 함수 내부에 정의되어 있지 않은가
- [ ] `{count && <Comp />}` 패턴 (숫자 렌더링 위험)을 사용하지 않는가
- [ ] 컴포넌트가 150줄을 초과하지 않는가
- [ ] shadcn 컴포넌트 소스(`src/components/ui/`)를 직접 수정하지 않았는가

---

## 규칙 상세

### 1. 파일 구조 순서

```ts
// 1. 'use client' (필요 시만)
'use client'

// 2. 외부 라이브러리
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'

// 3. 내부 import
import { createWorkoutAction, type CreateWorkoutState } from '@/lib/actions/workout'
import type { WorkoutLog } from '@/types'

// 4. Props 타입
type WorkoutFormProps = {
  defaultDate: string
  hasProfile: boolean
}

// 5. 모듈 수준 상수
const intensityLabel: Record<WorkoutLog['intensity'], string> = {
  low: '낮음',
  moderate: '보통',
  high: '높음',
}

// 6. 초기 상태
const initialState: CreateWorkoutState = {
  error: null,
  success: false,
  errors: {},
}

// 7. 컴포넌트
export function WorkoutForm({ defaultDate, hasProfile }: WorkoutFormProps) { ... }
```

### 2. useActionState (React 19)

```tsx
'use client'
import { useActionState } from 'react'  // react 패키지에서 import

export function WorkoutForm() {
  const [state, formAction, pending] = useActionState(createWorkoutAction, initialState)

  return (
    <form action={formAction}>
      <Button type="submit" disabled={pending}>
        {pending ? '저장 중...' : '저장하기'}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  )
}
```

### 3. 서버 컴포넌트 내 inline Server Action (삭제)

```tsx
// 'use client' 없는 서버 컴포넌트
export function WorkoutCard({ log }: WorkoutCardProps) {
  async function submitDeleteAction() {
    'use server'
    await deleteWorkoutAction(log.id)
  }
  return (
    <form action={submitDeleteAction}>
      <Button type="submit" variant="outline" size="sm">삭제</Button>
    </form>
  )
}
```

### 4. 조건부 렌더링

```tsx
// ✅ null 반환
{error ? <p className="text-sm text-destructive">{error}</p> : null}
{log.notes ? <p className="text-sm">{log.notes}</p> : null}

// ✅ 배열 조건 — length > 0
{logs.length > 0 && <WorkoutList logs={logs} />}

// ❌ 금지 — 0이 그대로 렌더링됨
{logs.length && <WorkoutList logs={logs} />}
```

### 5. shadcn/ui 주요 variant

```tsx
<Button variant="outline" size="sm">취소</Button>
<Button variant="destructive" size="sm">삭제</Button>
<Badge variant="secondary">낮음</Badge>
<Badge variant="outline">보통</Badge>
<Badge variant="destructive">높음</Badge>
```

---
name: nextjs-app-router
description: Next.js App Router 패턴 규칙. 계획 작성 시 주의사항 생성, 리뷰 시 위반 체크에 사용한다.
trigger: /nextjs-app-router
---

You are now in **nextjs-app-router mode**.

Next.js App Router(v16.x) 규칙을 계획에 반영하고, 구현 결과물을 아래 기준으로 심사한다.

---

## 계획 작성 시 — `## 주의사항`에 추가

```
- 모든 컴포넌트는 서버 컴포넌트가 기본. 훅/이벤트 필요 시에만 `'use client'` 추가
- page.tsx는 데이터 페칭 + 에러 렌더링 + 컴포넌트 조합만 담당. 비즈니스 로직은 `src/lib/`로 분리
- 독립적인 데이터 페칭은 `Promise.all`로 병렬 처리
- `searchParams`는 `Promise<...>` 타입으로 `await` 필요 (Next.js 15+)
- `revalidatePath`는 DB 쓰기 성공 후에만 호출
- `/nextjs-app-router` 규칙 준수
```

---

## 리뷰 체크리스트

아래 항목 위반 시 해당 Phase 통과 불가:

- [ ] `page.tsx`에 `'use client'`가 붙어 있지 않은가
- [ ] `page.tsx`에 비즈니스 로직(날짜 계산, 데이터 변환)이 인라인으로 없는가
- [ ] 독립적인 데이터 페칭이 `Promise.all`로 병렬 처리되는가
- [ ] `searchParams`를 `await` 없이 직접 사용하고 있지 않은가
- [ ] `revalidatePath`가 에러 반환 전에 호출되고 있지 않은가
- [ ] 페이지 `<main>` wrapper가 표준 클래스를 사용하는가

---

## 규칙 상세

### 1. Server vs Client Component

```tsx
// ✅ 서버 컴포넌트 — async/await 직접 사용
export default async function WorkoutPage() {
  const logs = await getWorkoutLogs()
  return <WorkoutList logs={logs} />
}

// ✅ 클라이언트 컴포넌트 — 훅 사용 시에만
'use client'
export function WorkoutForm() {
  const [state, formAction, pending] = useActionState(...)
}

// ❌ 금지 — 페이지 전체 클라이언트화
'use client'
export default function WorkoutPage() { ... }
```

`'use client'` 추가 조건: `useState` / `useReducer` / `useEffect` / `useActionState` / `useFormStatus` / `useRef` / 브라우저 API

### 2. page.tsx 구조

```tsx
export default async function WorkoutPage() {
  const today = getToday()  // lib 유틸 함수
  const [{ data: logs, error: logsError }, { data: profile }] = await Promise.all([
    getWorkoutLogs({ date: today }),
    getProfile(),
  ])

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-28">
      {logsError ? <p className="text-sm text-destructive">{logsError}</p> : null}
      <WorkoutForm defaultDate={today} hasProfile={Boolean(profile)} />
      <WorkoutList logs={logs ?? []} />
    </main>
  )
}
```

### 3. searchParams (Next.js 15+)

```tsx
type Props = {
  searchParams: Promise<{ period?: string }>
}

export default async function AnalysisPage({ searchParams }: Props) {
  const { period } = await searchParams  // 반드시 await
}
```

### 4. revalidatePath

```ts
// ✅ 성공 후에만
revalidatePath('/workout')
return { error: null, success: true, errors: {} }

// ❌ 금지 — 실패 시 호출
if (result.error) {
  revalidatePath('/workout')  // 금지
  return { error: result.error, ... }
}
```

### 5. 파일 위치

| 종류 | 위치 |
|------|------|
| 페이지 | `src/app/[route]/page.tsx` |
| Server Action | `src/lib/actions/[entity].ts` |
| DB 쿼리 | `src/lib/db/queries/[entity].ts` |
| 페이지 전용 컴포넌트 | `src/components/[route]/` |
| 유틸 함수 | `src/lib/utils.ts` |

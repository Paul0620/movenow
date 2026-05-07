# Phase 11 — 패키지 업데이트 및 최신 공식문서 개선

> 날짜: 2026-05-07
> 상태: 완료

## 목표

주요 패키지를 최신 버전으로 업데이트하고, TypeScript 6.0 / Zod v4.4 공식문서 기준으로
코드 패턴을 개선한다.

---

## 현재 버전 vs 최신 버전

| 패키지 | 현재 | 최신 | 비고 |
| ------ | ---- | ---- | ---- |
| `react` / `react-dom` | 19.2.5 | 19.2.6 | 패치 |
| `zod` | 4.3.6 | 4.4.3 | 에러 API 개선 |
| `lucide-react` | 1.8.0 | 1.14.0 | 아이콘 추가 |
| `tailwindcss` | 4.2.2 | 4.2.4 | 패치 |
| `typescript` | 5.9.3 | 6.0.3 | 메이저 업그레이드 |
| `next` | 16.2.4 | 16.2.4 | 최신 유지 |
| `drizzle-orm` | 0.45.2 | 0.45.2 | 최신 유지 (v1 beta 대기) |
| `recharts` | 3.8.1 | 3.8.1 | 최신 유지 |

---

## 주의사항

- `use context7`으로 최신 stable 문서 확인 후 작성 (beta / rc 제외)
- `/code-quality` 규칙 준수 — any 타입, 타입 단언 남용, 우회 코드, 더티 로직 금지
- `/typescript-strict` 규칙 준수 — InferSelectModel 추론, Zod v4 패턴, unknown 에러 처리
- `/server-actions` 규칙 준수 — Server Action 패턴
- **기존 동작을 변경하지 않는다** — 업그레이드이므로 UI/기능은 그대로 유지
- 각 Step 완료 후 `pnpm tsc --noEmit`, `pnpm lint`, `pnpm dev` 확인

---

## Step 1. 패키지 버전 업데이트

아래 명령어로 대상 패키지만 업데이트한다.

```bash
pnpm add react@19.2.6 react-dom@19.2.6
pnpm add zod@4.4.3
pnpm add lucide-react@1.14.0
pnpm add -D tailwindcss@4.2.4 @tailwindcss/postcss@4.2.4
pnpm add -D typescript@6.0.3
```

업데이트 후 즉시 확인:

```bash
pnpm tsc --noEmit
pnpm lint
```

---

## Step 2. TypeScript 6.0 tsconfig 개선

**`tsconfig.json`** — target을 ES2017에서 ES2022로 올린다.

```jsonc
// 변경 전
"target": "ES2017"

// 변경 후
"target": "ES2022"
```

ES2022 타겟으로 올리면 `Object.hasOwn`, `at()`, `structuredClone` 등 모던 빌트인을
폴리필 없이 사용할 수 있고 번들 크기가 줄어든다.

변경 후 `pnpm tsc --noEmit` 통과 확인 필수.

---

## Step 3. Zod v4.4 에러 패턴 개선

Zod v4.4에서 `z.preprocess`를 사용한 빈 문자열 처리 패턴을 공식 권장 방식으로 교체한다.

**대상 파일:**
- `src/lib/actions/workout.ts`
- `src/lib/actions/diet.ts`

**현재 패턴 (z.preprocess):**

```ts
const optionalInt = z.preprocess((value) => {
  if (value === '' || value === null) return undefined
  return value
}, z.coerce.number().int().min(1).optional())

const optionalNumber = z.preprocess((value) => {
  if (value === '' || value === null) return undefined
  return value
}, z.coerce.number().min(0).optional())

const optionalString = z.preprocess((value) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}, z.string().max(500).optional())
```

**개선 패턴 (z.string().transform + pipe):**

Zod v4.4 공식 문서의 form input 처리 권장 패턴 적용:

```ts
// 빈 문자열 → undefined로 변환 후 숫자 파싱 (옵셔널 정수)
const optionalInt = z
  .string()
  .transform((val) => (val === '' ? undefined : val))
  .pipe(z.coerce.number().int().min(1).optional())

// 빈 문자열 → undefined로 변환 후 숫자 파싱 (옵셔널 실수)
const optionalNumber = z
  .string()
  .transform((val) => (val === '' ? undefined : val))
  .pipe(z.coerce.number().min(0).optional())

// 빈 문자열 → undefined로 변환 (옵셔널 문자열)
const optionalString = z
  .string()
  .trim()
  .transform((val) => (val === '' ? undefined : val))
  .pipe(z.string().max(500).optional())
```

`z.string().transform().pipe()` 패턴은 Zod v4.4에서 타입 추론이 더 정확하며,
`z.preprocess`의 `unknown` 입력 타입 문제를 피할 수 있다.

`diet.ts`의 `optionalAmount`도 동일하게 교체:

```ts
// 변경 전
const optionalAmount = z.preprocess((value) => {
  if (value === '' || value === null) return undefined
  return value
}, z.coerce.number().min(1).max(5000).optional())

// 변경 후
const optionalAmount = z
  .string()
  .transform((val) => (val === '' ? undefined : val))
  .pipe(z.coerce.number().min(1).max(5000).optional())
```

---

## Step 4. layout.tsx lang 속성 수정

`src/app/layout.tsx`의 `<html lang="en">`을 `"ko"`로 수정한다.
앱이 한국어 전용이므로 접근성(screen reader, 브라우저 번역 힌트) 기준에 맞게 수정.

```tsx
// 변경 전
<html lang="en" className="h-full antialiased">

// 변경 후
<html lang="ko" className="h-full antialiased">
```

---

## 완료 조건

- [x] `react`, `react-dom` 19.2.6 업데이트
- [x] `zod` 4.4.3 업데이트
- [x] `lucide-react` 1.14.0 업데이트
- [x] `tailwindcss` 4.2.4 업데이트
- [x] `typescript` 6.0.3 업데이트
- [x] `tsconfig.json` target `ES2022`로 변경
- [x] `workout.ts` — `optionalInt`, `optionalNumber`, `optionalString` → `.transform().pipe()` 패턴 교체
- [x] `diet.ts` — `optionalAmount` → `.transform().pipe()` 패턴 교체
- [x] `layout.tsx` — `lang="ko"` 수정
- [x] `pnpm tsc --noEmit` 통과
- [x] `pnpm lint` 통과
- [x] `pnpm dev` 정상 실행

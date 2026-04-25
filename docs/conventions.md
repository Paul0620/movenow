# Conventions

## 코드 포맷 규칙

Prettier + ESLint 병행 사용. 충돌 방지를 위해 `eslint-config-prettier` 적용.

| 항목         | 설정                        |
| ------------ | --------------------------- |
| 세미콜론     | 없음 (`semi: false`)        |
| 따옴표       | 단일 (`singleQuote: true`)  |
| 후행 쉼표    | 있음 (`trailingComma: all`) |
| 들여쓰기     | 2칸                         |
| 최대 줄 길이 | 100자                       |

| 명령어              | 용도                       |
| ------------------- | -------------------------- |
| `pnpm format`       | 전체 포맷 적용             |
| `pnpm format:check` | 포맷 검사만 (CI/완료 조건) |
| `pnpm lint`         | ESLint 검사                |
| `pnpm tsc --noEmit` | 타입 검사                  |

---

## Git 규칙

- `git commit`, `git push`는 사용자가 명시적으로 요청할 때만 실행한다
- 작업 완료 후 커밋을 제안하거나 암시하지 않는다
- 언제 커밋/푸시할지는 전적으로 사용자가 결정한다

---

## 최신 문서 기준 원칙

기술 스택 관련 코드를 작성하기 전에 반드시 `use context7`으로 최신 공식 문서를 확인한다.

- **베타(beta / rc / canary / alpha) 버전은 사용하지 않는다** — 최신 안정(stable) 버전 기준
- API, 패턴, import 경로가 바뀌었으면 최신 방식을 따른다

| 대상                                 | 확인 시점                    |
| ------------------------------------ | ---------------------------- |
| Next.js (App Router, Server Actions) | 페이지 / 서버 로직 작성 전   |
| Drizzle ORM                          | DB 쿼리 / 스키마 작성 전     |
| shadcn/ui                            | 컴포넌트 추가 / 사용 전      |
| Zod                                  | 스키마 정의 전               |
| Recharts                             | 차트 컴포넌트 작성 전        |

---

## 네이밍 규칙

| 대상              | 규칙                      | 예시                        |
| ----------------- | ------------------------- | --------------------------- |
| 컴포넌트 파일     | PascalCase                | `WorkoutCard.tsx`           |
| 유틸 / 훅 파일    | camelCase                 | `useWorkoutLog.ts`          |
| 타입 / 인터페이스 | PascalCase                | `WorkoutLog`, `DietEntry`   |
| DB 컬럼           | snake_case                | `calories_burned`           |
| 환경변수          | UPPER_SNAKE_CASE          | `DATABASE_URL`              |
| Server Action     | camelCase + Action suffix | `createWorkoutAction`       |

---

## 파일 배치 원칙

| 종류 | 위치 |
| ---- | ---- |
| 페이지 | `src/app/[route]/page.tsx` |
| 레이아웃 | `src/app/layout.tsx` |
| 페이지 전용 컴포넌트 | `src/components/[route]/` |
| 공통 컴포넌트 | `src/components/` |
| shadcn UI | `src/components/ui/` |
| Server Action | `src/lib/actions/[entity].ts` |
| DB 스키마 | `src/lib/db/schema.ts` |
| DB 연결 | `src/lib/db/index.ts` |
| DB 쿼리 | `src/lib/db/queries/[entity].ts` |
| 계산 로직 | `src/lib/calculations/` |
| 유틸 함수 | `src/lib/utils.ts` |
| Mock 데이터 | `src/lib/mock/data.ts` |
| 타입 정의 | `src/types/index.ts` |

---

## 그룹화 규칙

> 같은 유형의 파일이 **3개 이상** 모이면 하위 폴더로 그룹화한다.

```
# Before (3개 누적 시점)
src/components/
├── WorkoutCard.tsx
├── WorkoutForm.tsx
└── WorkoutList.tsx

# After (그룹화)
src/components/
└── workout/
    ├── WorkoutCard.tsx
    ├── WorkoutForm.tsx
    └── WorkoutList.tsx
```

---

## 컴포넌트 작성 원칙

- Server Component 우선, 훅/이벤트 필요 시에만 `'use client'` 추가
- Props 타입은 `type 컴포넌트명Props` 형식으로 정의 (`interface` 금지)
- shadcn/ui 컴포넌트를 먼저 활용, 커스텀은 `className` prop으로만
- 컴포넌트 150줄 초과 시 반드시 분리
- 라벨 맵 상수는 컴포넌트 함수 외부(모듈 수준)에 정의

---

## 코드 품질 원칙

- `any` 타입 금지 — `unknown` + 타입 가드로 대체
- 타입 단언(`as`) 금지 — Zod `safeParse` 결과 활용
- `catch` 블록 에러는 `toErrorMessage(error: unknown)` 헬퍼로 처리
- 타입은 `InferSelectModel`로 스키마에서 추론. 수동 타입 정의 금지
- `enum` 금지 — 리터럴 유니온 타입으로 대체
- `console.log` 커밋 금지

---

## Server Actions 원칙

- 파일 위치: `src/lib/actions/[entity].ts`
- 파일 최상단에 `'use server'` 선언
- create/update 시그니처: `(prevState: State, formData: FormData): Promise<State>`
- 모든 FormData 입력값은 Zod `safeParse`로 검증 (`parse()` 금지)
- 반환 타입: `{ error: string | null; success: boolean; errors: FieldErrors }`
- 처리 순서: Zod 검증 → 의존 데이터 조회 → DB 쓰기 → revalidatePath → 성공 반환
- `revalidatePath`는 DB 쓰기 성공 후에만 호출
- `redirect()` 사용 금지

---

## DB 쿼리 원칙

- DB 접근은 `getDb()`를 통해서만 (`src/lib/db/index.ts`)
- 스키마는 `src/lib/db/schema.ts` 한 파일에만 정의
- 쿼리 함수 반환 타입: 단건 `{ data: T | null; error }`, 목록 `{ data: T[]; error }`, 삭제 `{ error }`
- mock 분기(`if (isMockMode)`)는 함수 최상단 한 줄로만
- 모든 쿼리 파일 최상단에 `import 'server-only'`
- 스키마 수정 시 `pnpm db:push` 실행

---

## 계획 파일 규칙 (docs/plans/)

파일명: `YYYY-MM-DD-phase[N]-[title].md`

### 템플릿

```markdown
# Phase N — 작업 제목

> 날짜: YYYY-MM-DD
> 상태: 대기 중

## 목표

한 문장으로 이 Phase의 목적 설명

---

## 주의사항

- `use context7`으로 최신 stable 문서 확인 후 작성 (beta / rc 제외)
- `/code-quality` 규칙 준수 — any 타입, 타입 단언 남용, 우회 코드, 더티 로직 금지
- `/typescript-strict` 규칙 준수 — InferSelectModel 추론, Zod v4 패턴, unknown 에러 처리
- (페이지/컴포넌트 작업 시) `/nextjs-app-router` 규칙 준수 — Server Component 기본, Promise.all 병렬 페칭
- (Server Action 작업 시) `/server-actions` 규칙 준수 — safeParse, flattenError, revalidatePath 순서
- (DB 쿼리 작업 시) `/drizzle-orm` 규칙 준수 — getDb(), { data, error } 반환, mock 분기 최상단
- (컴포넌트 작업 시) `/react-components` 규칙 준수 — useActionState from 'react', Props type, 라벨 맵 모듈 수준
- (스타일 작업 시) `/styling` 규칙 준수 — shadcn 토큰, 인라인 스타일 금지, 표준 wrapper

---

## Step 1. ...

## Step 2. ...

---

## 완료 조건

- [ ] 기능 요구사항 달성
- [ ] `pnpm tsc --noEmit` 통과 (타입 에러 없음)
- [ ] `pnpm lint` 통과
- [ ] `pnpm dev` 정상 실행
```

### 상태값

| 상태      | 의미                      | 변경 주체             |
| --------- | ------------------------- | --------------------- |
| `대기 중` | Claude 작성 완료, 실행 전 | Claude가 생성 시 설정 |
| `진행 중` | Codex 작업 중             | Codex가 시작 시 변경  |
| `완료`    | 완료 조건 전부 통과       | Codex가 완료 시 변경  |

**완료 조건을 모두 통과해야만 상태를 `완료`로 변경한다.**

파일은 삭제하지 않는다 — 히스토리로 영구 보존.

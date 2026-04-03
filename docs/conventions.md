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
| Supabase                             | DB 쿼리 / 클라이언트 설정 전 |
| shadcn/ui                            | 컴포넌트 추가 / 사용 전      |
| Zod                                  | 스키마 정의 전               |
| Recharts                             | 차트 컴포넌트 작성 전        |

**이유**: 버전 업데이트로 API, 패턴, 권장 방식이 바뀔 수 있음. 구버전 코드 작성 방지.

---

## 네이밍 규칙

| 대상              | 규칙                      | 예시                       |
| ----------------- | ------------------------- | -------------------------- |
| 컴포넌트 파일     | PascalCase                | `WorkoutCard.tsx`          |
| 유틸 / 훅 파일    | camelCase                 | `useWorkoutLog.ts`         |
| 타입 / 인터페이스 | PascalCase                | `WorkoutLog`, `DietEntry`  |
| DB 컬럼           | snake_case                | `calories_burned`          |
| 환경변수          | UPPER_SNAKE_CASE          | `NEXT_PUBLIC_SUPABASE_URL` |
| Server Action     | camelCase + Action suffix | `createWorkoutAction`      |

---

## 파일 배치 원칙

- 컴포넌트: `src/components/`
- 페이지별 컴포넌트: `src/components/{페이지명}/`
- 공통 컴포넌트: `src/components/ui/` (shadcn/ui 포함)
- 계산 로직: `src/lib/calculations/`
- Supabase 쿼리: `src/lib/supabase/`
- 타입 정의: `src/types/`

---

## 그룹화 규칙

> 같은 유형의 파일이 **3개 이상** 모이면 하위 폴더로 그룹화한다.

### 적용 예시

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

```
# docs/ 예시
docs/
├── api-workout.md
├── api-diet.md
└── api-nutrition.md
→ docs/api/ 폴더로 통합
```

### 그룹화 기준 패턴

| 파일 패턴                    | 그룹 폴더             |
| ---------------------------- | --------------------- |
| `Workout*.tsx` 3개+          | `components/workout/` |
| `Diet*.tsx` 3개+             | `components/diet/`    |
| `use*.ts` 3개+ (같은 도메인) | `hooks/{도메인}/`     |
| `*Action.ts` 3개+            | `actions/`            |
| `api-*.md` 3개+              | `docs/api/`           |

---

## 컴포넌트 작성 원칙

- Server Component 우선, 클라이언트 상태 필요 시에만 `'use client'`
- Props 타입은 인라인 대신 별도 `type` 정의
- shadcn/ui 컴포넌트를 먼저 활용, 커스텀은 최소화

---

## 계획 파일 규칙 (docs/plans/)

파일명: `YYYY-MM-DD-title.md`

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
- 작업 전 알아야 할 내용

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

---

## Server Actions 원칙

- 파일명: `src/lib/actions/{도메인}.ts`
- 반환 타입: `{ data, error }` 형태로 통일
- Zod로 입력값 검증 후 Supabase 호출

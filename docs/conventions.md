# Conventions

## 최신 문서 기준 원칙

기술 스택 관련 코드를 작성하기 전에 반드시 `use context7`으로 최신 공식 문서를 확인한다.

| 대상 | 확인 시점 |
|------|----------|
| Next.js (App Router, Server Actions) | 페이지 / 서버 로직 작성 전 |
| Supabase | DB 쿼리 / 클라이언트 설정 전 |
| shadcn/ui | 컴포넌트 추가 / 사용 전 |
| Zod | 스키마 정의 전 |
| Recharts | 차트 컴포넌트 작성 전 |

**이유**: 버전 업데이트로 API, 패턴, 권장 방식이 바뀔 수 있음. 구버전 코드 작성 방지.

---

## 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `WorkoutCard.tsx` |
| 유틸 / 훅 파일 | camelCase | `useWorkoutLog.ts` |
| 타입 / 인터페이스 | PascalCase | `WorkoutLog`, `DietEntry` |
| DB 컬럼 | snake_case | `calories_burned` |
| 환경변수 | UPPER_SNAKE_CASE | `NEXT_PUBLIC_SUPABASE_URL` |
| Server Action | camelCase + Action suffix | `createWorkoutAction` |

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

| 파일 패턴 | 그룹 폴더 |
|----------|----------|
| `Workout*.tsx` 3개+ | `components/workout/` |
| `Diet*.tsx` 3개+ | `components/diet/` |
| `use*.ts` 3개+ (같은 도메인) | `hooks/{도메인}/` |
| `*Action.ts` 3개+ | `actions/` |
| `api-*.md` 3개+ | `docs/api/` |

---

## 컴포넌트 작성 원칙

- Server Component 우선, 클라이언트 상태 필요 시에만 `'use client'`
- Props 타입은 인라인 대신 별도 `type` 정의
- shadcn/ui 컴포넌트를 먼저 활용, 커스텀은 최소화

---

## 계획 파일 규칙 (docs/plans/)

파일명: `YYYY-MM-DD-title.md`

파일 상단 메타데이터:
```
> 날짜: YYYY-MM-DD
> 상태: 대기 중
```

### 상태값

| 상태 | 의미 | 변경 주체 |
|------|------|----------|
| `대기 중` | Claude 작성 완료, 실행 전 | Claude가 생성 시 설정 |
| `진행 중` | Codex 작업 중 | Codex가 시작 시 변경 |
| `완료` | 구현 완료 | Codex가 완료 시 변경 |

파일은 삭제하지 않는다 — 히스토리로 영구 보존.

---

## Server Actions 원칙

- 파일명: `src/lib/actions/{도메인}.ts`
- 반환 타입: `{ data, error }` 형태로 통일
- Zod로 입력값 검증 후 Supabase 호출

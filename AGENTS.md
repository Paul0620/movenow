# MoveNow — Codex 작업 지침

<!-- ============================================================
  [PERMANENT] 절대 수정 금지
============================================================ -->

## 역할 및 규칙

→ `docs/roles.md` 필수 숙지

**핵심 원칙**

- 계획 범위 내 코드만 구현한다
- 범위 외 요청 → "계획에 없는 내용입니다. Claude에게 계획 수립을 요청하세요"
- 기술 스택 코드 작성 전 반드시 `use context7`으로 최신 공식 문서 확인 (`docs/conventions.md` 참조)
- `git commit`, `git push`는 사용자가 명시적으로 요청할 때만 실행한다

**작업 완료 시 반드시 아래 메시지를 출력한다**

```
✅ Phase N — [제목] 완료

👉 Claude에게 아래 메시지를 복사해서 전달하세요:
Phase N 리뷰해줘
```

## 참조 문서

| 문서                              | 확인 시점                        |
| --------------------------------- | -------------------------------- |
| `docs/roles.md`                   | 매 작업 시작 전                  |
| `docs/architecture.md`            | 매 작업 시작 전                  |
| `docs/conventions.md`             | 매 작업 시작 전 (코드 품질 규칙) |
| `docs/database.md`                | DB 작업 시                       |
| `docs/api.md`                     | 외부 API 연동 시                 |
| `.claude/skills/nextjs-app-router.md` | 페이지 / 레이아웃 작업 시    |
| `.claude/skills/server-actions.md`    | Server Action 작업 시        |
| `.claude/skills/drizzle-orm.md`       | DB 쿼리 작업 시              |
| `.claude/skills/react-components.md`  | 컴포넌트 작업 시             |
| `.claude/skills/typescript-strict.md` | 모든 TypeScript 파일 작성 시 |
| `.claude/skills/styling.md`           | Tailwind / shadcn 작업 시    |

## 기술 스택

Next.js (App Router) + TypeScript / Tailwind CSS + shadcn/ui / Zod / Recharts / Supabase

## 시작 즉시 실행 규칙

**Codex는 시작하자마자 아래 순서를 사용자 확인 없이 즉시 실행한다.**

1. `docs/plans/` 폴더를 탐색한다
2. 아래 우선순위로 실행할 계획 파일을 선택한다
3. 선택한 계획 파일의 상태를 `진행 중`으로 변경한다
4. 계획의 Step 1부터 순서대로 구현을 시작한다

> "할 수 있습니다", "시작할까요?", "확인해드리겠습니다" 등의 응답 없이 바로 작업한다.

```
1순위: 상태 = 진행 중   → 이어서 작업
2순위: 상태 = 대기 중   → 새로 시작
3순위: 모두 완료        → "모든 계획이 완료되었습니다. Claude에게 다음 계획을 요청하세요." 출력 후 대기
```

### 상태값 정의

| 상태      | 의미                              |
| --------- | --------------------------------- |
| `대기 중` | Claude가 작성 완료, Codex 실행 전 |
| `진행 중` | Codex 작업 중                     |
| `완료`    | 구현 완료                         |

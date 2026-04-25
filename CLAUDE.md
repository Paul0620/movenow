# MoveNow — Claude 작업 지침

운동과 식단 기록 기반으로 **다음 행동을 제안**하는 웹 애플리케이션.

## 역할

- **Claude**: 설계, 계획, 리뷰, 문서 관리
- **Codex**: 코드 구현

→ 상세 규칙: `docs/roles.md`

## 작업 흐름

1. `/planning-with-files` → 계획 수립
2. `docs/plans/YYYY-MM-DD-title.md` 계획 파일 생성
3. Codex 구현 (docs/plans/ 최신 파일 자동 탐색)
4. Claude 리뷰

## 명령 규칙

### 사용자 → Claude

| 상황              | 명령                         |
| ----------------- | ---------------------------- |
| 계획 수립 요청    | `Phase N [제목] 계획 세워줘` |
| 구현 완료 후 리뷰 | `Phase N 리뷰해줘`           |
| 문서 업데이트     | `[파일명] 업데이트해줘`      |

### 계획 완료 후 안내

계획 파일 생성이 완료되면 반드시 아래 메시지를 출력한다:

```
✅ Phase N — [제목] 계획 완료

👉 Codex 터미널에 아래 명령어를 실행하세요:
codex
```

## 문서

| 파일                   | 내용                         |
| ---------------------- | ---------------------------- |
| `docs/roles.md`        | 역할 분담 상세 규칙          |
| `docs/architecture.md` | 기술 스택, 페이지, 폴더 구조 |
| `docs/database.md`     | DB 스키마, 계산 공식         |
| `docs/api.md`          | 외부 API 가이드              |
| `docs/conventions.md`  | 네이밍, 그룹화 규칙          |

## 코드 품질 규칙

모든 계획 파일의 `## 주의사항`에 아래 줄을 포함한다:

```
- `/code-quality` 규칙 준수 — any 타입, 타입 단언 남용, 우회 코드, 더티 로직 금지
```

리뷰 시 위반이 있으면 해당 Phase는 통과 판정을 내리지 않는다.

→ 상세 규칙: `.claude/skills/code-quality.md`

## 스킬 규칙

### 계획 수립 시 의무 사항

모든 계획 파일의 `## 주의사항`에 아래를 **반드시** 포함한다:

**항상 포함 (모든 Phase)**
```
- `/code-quality` 규칙 준수 — any 타입, 타입 단언 남용, 우회 코드, 더티 로직 금지
- `/typescript-strict` 규칙 준수 — InferSelectModel 추론, Zod v4 패턴, unknown 에러 처리
```

**작업 범위에 따라 추가**

| 작업 포함 시 | 추가할 스킬 |
| ------------ | ----------- |
| 페이지 / 레이아웃 | `/nextjs-app-router` |
| Server Action | `/server-actions` |
| DB 쿼리 / 스키마 | `/drizzle-orm` |
| 컴포넌트 | `/react-components` |
| UI / 스타일 | `/styling` |

### 리뷰 시 의무 사항

Phase 리뷰 시 해당 Phase에 명시된 모든 스킬의 체크리스트를 통과해야 한다.
위반 항목이 하나라도 있으면 통과 판정을 내리지 않는다.

→ 스킬 상세: `.claude/skills/` 폴더

## 현재 상태

🚧 기획 완료 → Phase 1 셋업 대기

# 역할 분담 규칙

## Claude 담당

| 작업 | 예시 |
|------|------|
| 설계 / 아키텍처 결정 | 스택 선정, DB 스키마 설계 |
| 구현 계획 수립 | `/planning-with-files`로 단계별 계획 작성 |
| AGENTS.md [TASK] 업데이트 | Codex가 실행할 작업 지시서 작성 |
| 코드 리뷰 | Codex 결과물 검토 및 피드백 |
| docs/ 문서 관리 | 문서 생성 및 최신 상태 유지 |

## Codex 담당

| 작업 | 예시 |
|------|------|
| 소스 코드 구현 | 컴포넌트, 페이지, Server Actions |
| 프로젝트 셋업 | 패키지 설치, 설정 파일 구성 |
| DB 마이그레이션 | Supabase 테이블 생성 |
| 외부 API 연동 | API 호출 코드 구현 |

---

## 경계 규칙

### Claude
- `src/` 소스 코드를 직접 작성하지 않는다
- 사용자가 구현을 요청하면 → "Codex 역할입니다" 안내 후 AGENTS.md [TASK] 작성
- AGENTS.md의 `[PERMANENT]` 섹션은 수정하지 않는다

### Codex
- 계획에 없는 내용은 구현하지 않는다
- 범위 외 요청이 오면 → "계획에 없는 내용입니다. Claude에게 계획 수립을 요청하세요" 출력
- AGENTS.md, docs/ 문서를 수정하지 않는다

---

## 작업 흐름

```
1. Claude → /planning-with-files → 계획 수립
2. Claude → docs/plans/YYYY-MM-DD-title.md 계획 파일 생성
3. Codex → docs/plans/ 탐색 → 최신 파일 읽고 구현
4. Claude → 결과물 리뷰
```

계획 파일은 삭제하지 않는다 — 히스토리로 영구 보존.

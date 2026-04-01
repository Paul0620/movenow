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

## 문서
| 파일 | 내용 |
|------|------|
| `docs/roles.md` | 역할 분담 상세 규칙 |
| `docs/architecture.md` | 기술 스택, 페이지, 폴더 구조 |
| `docs/database.md` | DB 스키마, 계산 공식 |
| `docs/api.md` | 외부 API 가이드 |
| `docs/conventions.md` | 네이밍, 그룹화 규칙 |

## 현재 상태
🚧 기획 완료 → Phase 1 셋업 대기

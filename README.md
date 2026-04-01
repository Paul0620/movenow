# MoveNow

**Move now. No excuses.**
지금 움직여. 핑계는 없다.

---

## 소개

MoveNow는 운동과 식단을 단순히 기록하는 것을 넘어,
**개인의 신체 정보와 행동 데이터를 기반으로 다음 행동을 제안**하는 웹 애플리케이션입니다.

> 기록 → 분석 → 행동

---

## 핵심 기능

- **운동 기록** — 종류 제한 없이 자유롭게, 소모 칼로리 자동 계산
- **식단 기록** — 음식 검색으로 영양정보 자동 입력
- **개인 기준 생성** — 신체 정보 기반 칼로리 / 단백질 / 운동량 목표 자동 계산
- **행동 제안** — 오늘 가장 부족한 항목 1~2개를 우선순위로 노출
- **분석 차트** — 주간 / 월간 데이터 시각화

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Validation | Zod |
| Chart | Recharts |
| Server | Next.js Server Actions |
| Database | Supabase (PostgreSQL) |

외부 API: Open Food Facts, wger API, USDA FoodData Central (모두 무료)

---

## 구현 계획

| Phase | 내용 |
|-------|------|
| 1 | 프로젝트 셋업 |
| 2 | DB 스키마 & Supabase 연결 |
| 3 | Profile 페이지 |
| 4 | Workout 기록 CRUD |
| 5 | Diet 기록 CRUD |
| 6 | Dashboard + 행동 제안 |
| 7 | Analysis 차트 |

---

## 문서

| 문서 | 내용 |
|------|------|
| [architecture.md](docs/architecture.md) | 기술 스택, 페이지 구성, 폴더 구조, 데이터 흐름 |
| [database.md](docs/database.md) | DB 스키마, 계산 공식 |
| [api.md](docs/api.md) | 외부 API 사용 가이드 |
| [conventions.md](docs/conventions.md) | 네이밍, 그룹화 규칙 |

---

## 상태

🚧 기획 완료 → Phase 1 셋업 대기

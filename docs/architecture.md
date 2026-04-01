# Architecture

## 기술 스택

| 분류 | 기술 |
|------|------|
| Package Manager | pnpm |
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Validation | Zod |
| Chart | Recharts |
| Server | Next.js Server Actions |
| Database | Supabase (PostgreSQL) |

---

## 데이터 흐름

```
신체 정보 (Profile)
        ↓
개인 기준 자동 계산 (BMR / TDEE / 단백질 목표 / 운동시간 목표)
        ↓
운동 기록 + 식단 기록 (실제 데이터)
        ↓
기준 vs 실제 비교 → 행동 제안 (실시간 계산, DB 저장 없음)
```

---

## 페이지 구성

| 페이지 | 경로 | 역할 |
|--------|------|------|
| Dashboard | `/` | 오늘 요약 + 우선순위 행동 제안 1~2개 |
| Workout | `/workout` | 운동 기록 목록 + 추가 |
| Diet | `/diet` | 식단 기록 목록 + 추가 |
| Profile | `/profile` | 신체 정보 입력 / 수정 |
| Analysis | `/analysis` | 주간 / 월간 차트 분석 |

---

## 프로젝트 폴더 구조 (예정)

```
movenow/
├── .claude/
│   └── skills/              # 프로젝트 전용 Claude 스킬
├── docs/                    # 프로젝트 공유 문서 (Claude + Codex)
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   ├── conventions.md
│   └── roles.md
├── src/
│   ├── app/                 # Next.js App Router 페이지
│   │   ├── (dashboard)/
│   │   ├── workout/
│   │   ├── diet/
│   │   ├── profile/
│   │   └── analysis/
│   ├── components/          # UI 컴포넌트
│   ├── lib/                 # 유틸, Supabase 클라이언트, 계산 로직
│   └── types/               # TypeScript 타입 정의
├── AGENTS.md                # 현재 작업 지시 (Codex용, 작업마다 교체)
├── CLAUDE.md                # Claude 역할 및 워크플로우
└── README.md
```

---

## 행동 제안 로직

**우선순위 기반** — 가장 부족한 항목 1~2개만 노출, 실시간 계산

```
단백질 섭취 < 목표 80%  →  "단백질 추가 섭취 필요 (-Xg)"
운동 시간 < 목표        →  "오늘 운동량 부족 (-X분)"
칼로리 초과             →  "오늘 섭취 칼로리 초과 (+Xkcal)"
운동 3일 이상 미기록    →  "운동 기록 없음, 활동 필요"
```

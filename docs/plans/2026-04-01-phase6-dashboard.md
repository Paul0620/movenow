# Phase 6 — Dashboard

> 날짜: 2026-04-01
> 상태: 완료

## 목표

오늘의 운동·식단 요약과 우선순위 기반 행동 제안 1~2개를 표시하는 Dashboard를 완성한다. 모든 계산은 실시간, DB에 저장하지 않는다.

---

## 주의사항

- `use context7`으로 최신 stable 문서 확인 후 작성 (beta / rc 제외)
- `/code-quality` 규칙 준수 — any 타입, 타입 단언 남용, 우회 코드, 더티 로직 금지
- 행동 제안 계산 로직은 `src/lib/calculations/suggestions.ts`에 순수 함수로 분리
- Profile 미설정 시 → Dashboard 전체 대신 프로필 설정 유도 화면 표시
- 모든 데이터 조회는 Server Component에서 병렬 처리 (`Promise.all`)

---

## Step 1. 행동 제안 계산 로직

`src/lib/calculations/suggestions.ts` 생성:

**타입 정의:**

```ts
export type Suggestion = {
  type: 'protein' | 'workout_time' | 'calories' | 'no_workout'
  message: string
  priority: number  // 낮을수록 우선순위 높음
}
```

**입력 타입:**

```ts
type SuggestionInput = {
  profile: Profile
  todayWorkoutLogs: WorkoutLog[]
  todayDietLogs: DietLog[]
  recentWorkoutDates: string[]  // 최근 7일 운동한 날짜 목록
}
```

**함수:**

```ts
export function calcSuggestions(input: SuggestionInput): Suggestion[]
```

**우선순위 로직 (낮은 숫자 = 높은 우선순위, 최대 2개 반환):**

| 조건 | 메시지 | priority |
| ---- | ------ | -------- |
| 운동 3일 이상 미기록 | "최근 3일간 운동 기록이 없어요" | 1 |
| 단백질 섭취 < 목표 80% | "단백질이 부족해요 (-Xg)" | 2 |
| 오늘 운동 시간 < 목표 | "오늘 운동이 부족해요 (-X분)" | 3 |
| 칼로리 초과 | "오늘 칼로리를 초과했어요 (+Xkcal)" | 4 |

계산 기준:
- 단백질 목표: `calcProteinGoal(profile)`
- 운동 목표: `calcWorkoutGoalMinutes(profile.goal)`
- 칼로리 기준: `calcTDEE(profile)`
- 최근 3일 미기록: `recentWorkoutDates` 중 최근 3일에 해당하는 날짜가 없으면

---

## Step 2. Dashboard 데이터 조회

`src/app/page.tsx` — Server Component:

병렬 조회:
- `getProfile()`
- `getWorkoutLogs(today)` — 오늘 운동
- `getDietLogs(today)` — 오늘 식단
- `getWorkoutLogs()` — 최근 7일 (date 필터 없이, 7일치 슬라이스)

Profile 없으면 → 프로필 설정 유도 UI 반환 (이하 컴포넌트 렌더링 스킵)

---

## Step 3. Dashboard 컴포넌트

**`src/components/dashboard/SuggestionCard.tsx`** — Server Component:
- 행동 제안 1~2개 표시
- 제안 없으면 → "오늘 목표를 모두 달성했어요! 🎉" 메시지
- 각 제안: 아이콘 + 메시지

**`src/components/dashboard/TodaySummary.tsx`** — Server Component:
- 오늘 요약 수치 4개 카드:

| 항목 | 내용 |
| ---- | ---- |
| 칼로리 | 섭취 / 목표(TDEE) kcal |
| 단백질 | 섭취 / 목표 g |
| 운동 시간 | 오늘 총 분 / 목표 분 |
| 칼로리 소모 | 오늘 운동으로 소모한 kcal |

**`src/components/dashboard/ProfileMissing.tsx`** — Server Component:
- 프로필 미설정 안내
- `/profile`로 이동하는 버튼

---

## 완료 후 예상 폴더 구조

```
src/
├── app/
│   └── page.tsx                          ← Dashboard (Server Component)
├── components/
│   └── dashboard/
│       ├── SuggestionCard.tsx
│       ├── TodaySummary.tsx
│       └── ProfileMissing.tsx
└── lib/
    └── calculations/
        ├── index.ts                      (기존)
        └── suggestions.ts               ← 신규
```

---

## 완료 조건

- [ ] Profile 미설정 시 → 프로필 설정 유도 화면 표시
- [ ] 오늘 요약 (칼로리·단백질·운동시간·소모칼로리) 표시
- [ ] 행동 제안 최대 2개 우선순위 기준 표시
- [ ] 제안 없을 때 → 달성 메시지 표시
- [ ] `pnpm tsc --noEmit` 통과
- [ ] `pnpm lint` 통과
- [ ] `pnpm dev` 정상 실행

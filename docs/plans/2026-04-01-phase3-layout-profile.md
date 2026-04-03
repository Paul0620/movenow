# Phase 3 — Layout + Profile 페이지

> 날짜: 2026-04-01
> 상태: 완료

## 목표

앱 전체에 공통 적용되는 네비게이션 레이아웃을 구성하고, 신체 정보를 입력·수정하는 Profile 페이지를 완성한다. 저장 시 BMR / TDEE / 권장 단백질을 화면에 표시한다.

---

## 주의사항

- Server Component 우선, `'use client'`는 form 인터랙션이 필요한 컴포넌트에만 사용
- Server Action 파일은 `src/lib/actions/profile.ts` — Zod 검증 후 `upsertProfile()` 호출
- shadcn/ui 컴포넌트를 먼저 활용
- `use context7`으로 Next.js App Router layout, Server Actions 최신 패턴 확인 후 작성

---

## Step 1. shadcn/ui 컴포넌트 추가

```bash
pnpm dlx shadcn@latest add card input label select button
```

---

## Step 2. 공통 레이아웃 구성

`src/app/layout.tsx`를 수정하여 하단 네비게이션 포함:

**네비게이션 항목 (5개):**

| 라벨     | 경로        | 아이콘 (lucide-react) |
| -------- | ----------- | --------------------- |
| 홈       | `/`         | `Home`                |
| 운동     | `/workout`  | `Dumbbell`            |
| 식단     | `/diet`     | `UtensilsCrossed`     |
| 프로필   | `/profile`  | `User`                |
| 분석     | `/analysis` | `BarChart2`           |

구조:

```
src/app/layout.tsx         ← <html>, <body>, <BottomNav> 포함
src/components/BottomNav.tsx  ← 'use client', usePathname()으로 활성 탭 표시
```

`BottomNav` 구현 포인트:
- `usePathname()`으로 현재 경로 감지 → 활성 탭 강조
- 모바일 친화적 고정 하단 바 (`fixed bottom-0`)
- 각 항목: 아이콘 + 라벨, 세로 배치

---

## Step 3. Profile Server Action

`src/lib/actions/profile.ts` 생성:

**Zod 스키마:**

```ts
const ProfileSchema = z.object({
  height: z.coerce.number().min(100).max(250),
  weight: z.coerce.number().min(20).max(300),
  age: z.coerce.number().int().min(10).max(120),
  gender: z.enum(['male', 'female']),
  goal: z.enum(['loss', 'gain', 'maintain']),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
})
```

**Server Action:**

```ts
'use server'

export async function saveProfileAction(
  prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }>
```

- `FormData` → Zod 파싱 → 실패 시 `{ error: "..." }` 반환
- 기존 프로필 조회 (`getProfile`) → id 있으면 update, 없으면 insert
- 성공 시 `revalidatePath('/profile')` 호출

---

## Step 4. Profile 페이지

`src/app/profile/page.tsx` — Server Component:
- `getProfile()` 호출
- `<ProfileForm>` 에 profile 데이터 전달

`src/components/profile/ProfileForm.tsx` — `'use client'`:
- `useActionState`로 `saveProfileAction` 연결
- 필드: 키(cm), 몸무게(kg), 나이, 성별, 목표, 활동량
- 성별·목표·활동량은 `<Select>` 사용
- 저장 성공 후 계산 결과 표시 섹션 (Card):

```
BMR: 1,650 kcal
TDEE: 2,558 kcal
권장 칼로리: 2,558 kcal
권장 단백질: 120 g/일
권장 운동: 60 분/일
```

계산은 저장된 profile 데이터로 `calcBMR`, `calcTDEE`, `calcProteinGoal`, `calcWorkoutGoalMinutes` 호출.

---

## Step 5. 플레이스홀더 페이지 생성

이후 Phase에서 구현할 페이지들을 빈 상태로 미리 생성 (네비게이션 링크가 작동해야 함):

```
src/app/page.tsx           ← "Dashboard — 준비 중" 텍스트
src/app/workout/page.tsx   ← "Workout — 준비 중" 텍스트
src/app/diet/page.tsx      ← "Diet — 준비 중" 텍스트
src/app/analysis/page.tsx  ← "Analysis — 준비 중" 텍스트
```

> 기존 `src/app/page.tsx`가 있으면 내용만 교체.

---

## 완료 후 예상 폴더 구조

```
src/
├── app/
│   ├── layout.tsx                  ← BottomNav 포함
│   ├── page.tsx                    ← Dashboard placeholder
│   ├── workout/page.tsx            ← Workout placeholder
│   ├── diet/page.tsx               ← Diet placeholder
│   ├── profile/page.tsx            ← Profile (Server Component)
│   └── analysis/page.tsx           ← Analysis placeholder
├── components/
│   ├── BottomNav.tsx
│   └── profile/
│       └── ProfileForm.tsx
└── lib/
    └── actions/
        └── profile.ts
```

---

## 완료 조건

- [ ] `BottomNav` — 5개 탭 렌더링, 활성 탭 강조 동작
- [ ] Profile 폼 — 저장 시 DB upsert 및 계산 결과 표시
- [ ] Zod 검증 — 잘못된 값 입력 시 에러 메시지 표시
- [ ] 플레이스홀더 페이지 4개 — 네비게이션으로 이동 가능
- [ ] `pnpm tsc --noEmit` 통과
- [ ] `pnpm lint` 통과
- [ ] `pnpm dev` 정상 실행

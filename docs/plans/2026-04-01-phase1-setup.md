# Phase 1 — 프로젝트 셋업

> 날짜: 2026-04-01
> 상태: 대기 중

## 목표
현재 빈 폴더에 Next.js 기반 프로젝트를 초기화하고, 확정된 스택을 모두 연결한 개발 가능한 상태를 만든다.

---

## 주의사항
- 현재 폴더에 `README.md`, `CLAUDE.md`, `AGENTS.md`, `docs/` 가 존재함
- `create-next-app` 실행 시 기존 파일 덮어쓰기 여부를 묻는 프롬프트가 나오면 **덮어쓰지 않는다** (N 선택)

---

## Step 1. Next.js 프로젝트 초기화
```bash
pnpm create next-app@latest . \
  --typescript --tailwind --eslint \
  --app --src-dir --no-turbopack \
  --import-alias "@/*"
```

## Step 2. 패키지 설치
```bash
pnpm add @supabase/supabase-js zod recharts
pnpm add -D @types/recharts
pnpm dlx shadcn@latest init
```

shadcn init 옵션:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

## Step 3. 환경변수 파일 생성

`.env.local` 생성:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`.env.local.example` 생성 (깃 공유용, 키 값은 빈 문자열):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Step 4. Supabase 클라이언트 설정

`src/lib/supabase/client.ts` 생성 — 브라우저용
`src/lib/supabase/server.ts` 생성 — Server Actions용

## Step 5. 기본 폴더 구조 생성

```
src/
├── lib/
│   ├── supabase/       (Step 4에서 생성)
│   └── calculations/   (빈 폴더, .gitkeep)
└── types/
    └── index.ts
```

`src/types/index.ts` 내용:
```ts
export type Goal = 'loss' | 'gain' | 'maintain'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Intensity = 'low' | 'moderate' | 'high'
export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type Profile = {
  id: string
  height: number
  weight: number
  age: number
  gender: 'male' | 'female'
  goal: Goal
  activity_level: ActivityLevel
  created_at: string
  updated_at: string
}

export type WorkoutLog = {
  id: string
  date: string
  exercise_name: string
  duration_minutes: number
  intensity: Intensity
  sets?: number
  reps?: number
  weight_kg?: number
  calories_burned: number
  met_value: number
  notes?: string
  created_at: string
}

export type DietLog = {
  id: string
  date: string
  meal_time: MealTime
  food_name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  amount_g?: number
  created_at: string
}
```

## Step 6. .gitignore 확인
`.env.local`이 `.gitignore`에 포함되어 있는지 확인. 없으면 추가.

---

## 완료 조건
- `pnpm dev` 실행 시 Next.js 기본 페이지가 정상 동작
- `src/types/index.ts` 타입 에러 없음
- `.env.local` 이 `.gitignore`에 포함됨

# Phase 1 — 프로젝트 셋업

> 날짜: 2026-04-01
> 상태: 완료

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
pnpm add @supabase/supabase-js @supabase/ssr zod recharts
pnpm dlx shadcn@latest init
```

> `@supabase/ssr` — Next.js App Router에서 Server Components / Server Actions용 필수 패키지
> Recharts v2+는 타입 내장이므로 `@types/recharts`는 설치하지 않는다

shadcn init 옵션:

- Style: Default
- Base color: Neutral
- CSS variables: Yes

## Step 3. 환경변수 파일 생성

`.env.local` 생성:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
USDA_API_KEY=
```

`.env.local.example` 생성 (깃 공유용, 키 값은 빈 문자열):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
USDA_API_KEY=
```

## Step 4. Supabase 클라이언트 설정

`src/lib/supabase/client.ts` 생성 — 브라우저용:

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

`src/lib/supabase/server.ts` 생성 — Server Components / Server Actions용:

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Component에서 호출 시 무시
          }
        },
      },
    },
  )
}
```

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

## Step 6. Prettier 설치 및 설정

```bash
pnpm add -D prettier eslint-config-prettier
```

`.prettierrc` 생성:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100
}
```

`.prettierignore` 생성:

```
.next
node_modules
pnpm-lock.yaml
```

`eslint.config.mjs`에 prettier 연동 추가:

```js
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import prettier from 'eslint-config-prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [...compat.extends('next/core-web-vitals', 'next/typescript'), prettier]

export default eslintConfig
```

`package.json` scripts에 추가:

```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

## Step 7. .vscode/settings.json 생성

저장 시 자동 포맷 적용:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Step 8. .gitignore 확인

`.env.local`이 `.gitignore`에 포함되어 있는지 확인. 없으면 추가.

> `.env.local` — 실제 키 값, 절대 커밋 금지
> `.env.local.example` — 키 이름만 있는 빈 템플릿, 커밋 대상

---

## 완료 조건

- [ ] `pnpm dev` 실행 시 Next.js 기본 페이지 정상 동작
- [ ] `src/types/index.ts` 타입 에러 없음
- [ ] `.env.local` 이 `.gitignore`에 포함됨
- [ ] `pnpm tsc --noEmit` 통과
- [ ] `pnpm lint` 통과
- [ ] `pnpm format:check` 통과

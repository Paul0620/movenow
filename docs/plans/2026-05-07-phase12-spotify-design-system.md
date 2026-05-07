# Phase 12 — Spotify 디자인 시스템 적용

> 날짜: 2026-05-07
> 상태: 완료

## 목표

Spotify DESIGN.md 기반으로 MoveNow의 비주얼 아이덴티티를 확립한다.
다크 테마 + 그린 액센트로 피트니스 앱다운 에너지와 가독성을 부여한다.
기존 기능·레이아웃은 변경하지 않고 색상·타이포그래피·컴포넌트 형태만 교체한다.

---

## 디자인 토큰 (Spotify 기준)

| 토큰 | 값 | 용도 |
|------|----|------|
| `--background` | `#121212` | 페이지 최하단 배경 |
| `--card` | `#181818` | 카드·사이드바 |
| `--popover` | `#1f1f1f` | 버튼 배경·인터랙티브 |
| `--foreground` | `#ffffff` | 기본 텍스트 |
| `--muted-foreground` | `#b3b3b3` | 보조 텍스트·레이블 |
| `--primary` | `#1ed760` | CTA·활성 상태·그린 액센트 |
| `--primary-foreground` | `#000000` | 그린 버튼 위 텍스트 |
| `--secondary` | `#1f1f1f` | 보조 버튼 |
| `--secondary-foreground` | `#ffffff` | 보조 버튼 텍스트 |
| `--muted` | `#252525` | 뮤트 카드·얼터네이트 서피스 |
| `--accent` | `#272727` | 호버 하이라이트 |
| `--border` | `#4d4d4d` | 경계선 |
| `--input` | `#1f1f1f` | 인풋 배경 |
| `--ring` | `#1ed760` | 포커스 링 |
| `--destructive` | `#f3727f` | 에러·삭제 액션 |

차트 색상 (Recharts 적용):

| 토큰 | 값 |
|------|----|
| `--chart-1` | `#1ed760` | 주 데이터 (운동·칼로리) |
| `--chart-2` | `#539df5` | 보조 데이터 |
| `--chart-3` | `#ffa42b` | 경고 데이터 |
| `--chart-4` | `#b3b3b3` | 중립 데이터 |
| `--chart-5` | `#f3727f` | 초과 데이터 |

---

## 주의사항

- `/code-quality` 규칙 준수 — any 타입, 타입 단언 남용, 우회 코드, 더티 로직 금지
- `/typescript-strict` 규칙 준수 — InferSelectModel 추론, Zod v4 패턴, unknown 에러 처리
- `/nextjs-app-router` 규칙 준수 — 페이지·레이아웃 변경 시
- `/react-components` 규칙 준수 — 컴포넌트 수정 시
- `/styling` 규칙 준수 — CSS 변수·Tailwind 클래스 패턴
- **기존 기능·라우팅·데이터 로직을 변경하지 않는다**
- **라이트 모드는 제거한다** — 다크 단일 테마로 통일
- 각 Step 완료 후 `pnpm dev`로 전체 페이지 확인 필수

---

## Step 1. DESIGN.md 설치

프로젝트 루트에서 실행:

```bash
npx getdesign@latest add spotify
```

`DESIGN.md` 파일이 프로젝트 루트에 생성된다.
이후 모든 구현은 이 파일을 참고해서 진행한다.

---

## Step 2. globals.css — 다크 테마 CSS 변수 교체

`src/app/globals.css`의 `:root` 블록을 Spotify 토큰으로 전면 교체한다.
라이트/다크 분기 제거 — 단일 다크 테마로 통일.

**교체 대상 변수 (`:root` 전체):**

```css
:root {
  --font-sans: 'Segoe UI', 'Noto Sans KR', -apple-system, BlinkMacSystemFont,
    'Helvetica Neue', sans-serif;
  --font-geist-mono: 'SFMono-Regular', 'SF Mono', 'Segoe UI Mono', 'Roboto Mono',
    'Courier New', monospace;

  /* Spotify Dark Theme */
  --background: #121212;
  --foreground: #ffffff;
  --card: #181818;
  --card-foreground: #ffffff;
  --popover: #1f1f1f;
  --popover-foreground: #ffffff;
  --primary: #1ed760;
  --primary-foreground: #000000;
  --secondary: #1f1f1f;
  --secondary-foreground: #ffffff;
  --muted: #252525;
  --muted-foreground: #b3b3b3;
  --accent: #272727;
  --accent-foreground: #ffffff;
  --destructive: #f3727f;
  --border: #4d4d4d;
  --input: #1f1f1f;
  --ring: #1ed760;

  /* Charts */
  --chart-1: #1ed760;
  --chart-2: #539df5;
  --chart-3: #ffa42b;
  --chart-4: #b3b3b3;
  --chart-5: #f3727f;

  /* Radius — Spotify 스타일 (pill 중심) */
  --radius: 0.5rem;

  /* Sidebar */
  --sidebar: #121212;
  --sidebar-foreground: #ffffff;
  --sidebar-primary: #1ed760;
  --sidebar-primary-foreground: #000000;
  --sidebar-accent: #272727;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: #4d4d4d;
  --sidebar-ring: #1ed760;
}
```

기존 `.dark { ... }` 블록은 완전히 제거한다.
`<html>` 태그의 `class="dark"` 속성 추가는 불필요 — CSS 변수가 항상 다크값을 가짐.

---

## Step 3. globals.css — Spotify 타이포그래피 & 버튼 유틸리티 추가

`:root` 블록 아래에 추가:

```css
/* Spotify Typography Utilities */
@layer utilities {
  .text-spotify-title {
    font-size: 24px;
    font-weight: 700;
    line-height: normal;
  }

  .text-spotify-heading {
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
  }

  .text-spotify-body-bold {
    font-size: 16px;
    font-weight: 700;
  }

  .text-spotify-label {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.4px;
  }

  .text-spotify-caption {
    font-size: 14px;
    font-weight: 400;
    color: #b3b3b3;
  }

  .text-spotify-small {
    font-size: 12px;
    font-weight: 400;
    color: #b3b3b3;
  }

  /* Spotify Elevation Shadows */
  .shadow-spotify-card {
    box-shadow: rgba(0, 0, 0, 0.3) 0px 8px 8px;
  }

  .shadow-spotify-dialog {
    box-shadow: rgba(0, 0, 0, 0.5) 0px 8px 24px;
  }
}
```

---

## Step 4. shadcn 버튼 반경 교체

Spotify는 pill 형태(9999px)가 아이덴티티 핵심이다.
shadcn Button 컴포넌트(`src/components/ui/button.tsx`)에서 기본 반경을 pill로 변경:

- `rounded-md` → `rounded-full` (primary, secondary, destructive)
- `rounded-sm` → `rounded-full` (small size)
- `rounded-lg` → `rounded-full` (large size)

Input / Select 컴포넌트 반경:
- `rounded-md` → `rounded-2xl` (Spotify 인풋: 넓은 라운드, 완전 pill은 아님)

---

## Step 5. BottomNav 다크 스타일 적용

`src/components/BottomNav.tsx`에서:

- 배경: `bg-background` 유지 (이미 CSS 변수 → `#121212` 자동 적용)
- 활성 아이템: `text-primary` 유지 (→ `#1ed760` 자동 적용)
- 비활성 아이템: `text-muted-foreground` 유지 (→ `#b3b3b3` 자동 적용)
- 상단 구분선: `border-t border-border` 확인 (→ `#4d4d4d` 자동 적용)

CSS 변수 교체만으로 대부분 자동 반영되므로 BottomNav는 최소한의 확인만 진행한다.

---

## Step 6. 페이지별 UI 점검 및 미세 조정

각 페이지를 `pnpm dev`로 열어 다음을 확인하고 필요 시 클래스만 수정한다:

### Dashboard (`/`)
- 행동 제안 카드: `bg-card shadow-spotify-card` 적용
- 요약 수치(숫자): `text-spotify-body-bold` 또는 `font-bold` 확인
- 초과/달성 상태 색상: `text-destructive` / `text-primary` 확인

### Workout (`/workout`)
- 기록 리스트 카드: `bg-card` 배경 확인
- 추가 버튼: pill 형태(`rounded-full`) 확인
- 빈 상태 메시지: `text-muted-foreground` 확인

### Diet (`/diet`)
- Workout과 동일한 기준 적용

### Profile (`/profile`)
- 폼 인풋 배경: `bg-input` / `border-border` 확인
- 저장 버튼: `bg-primary text-primary-foreground rounded-full` 확인

### Analysis (`/analysis`)
- Recharts 색상: `--chart-1` ~ `--chart-5` CSS 변수가 자동 적용되는지 확인
- 차트 배경·그리드: 다크 배경에서 가독성 확인

---

## 완료 조건

- [x] `DESIGN.md` 프로젝트 루트에 생성
- [x] `globals.css` — Spotify 다크 토큰으로 `:root` 전면 교체
- [x] `globals.css` — 라이트 모드 `.dark {}` 블록 제거
- [x] `globals.css` — Spotify 유틸리티 클래스 추가
- [x] `button.tsx` — pill 반경(`rounded-full`) 적용
- [x] `input.tsx` / `select.tsx` — rounded-2xl 적용
- [x] `BottomNav` — 다크 테마 정상 표시 확인
- [x] Dashboard — 카드·수치·상태 색상 확인
- [x] Workout / Diet — 리스트 카드·버튼 확인
- [x] Profile — 폼 인풋·버튼 확인
- [x] Analysis — Recharts 차트 색상·가독성 확인
- [x] `pnpm tsc --noEmit` 통과
- [x] `pnpm lint` 통과
- [x] `pnpm dev` — 전체 5개 페이지 정상 렌더링

---
name: styling
description: Tailwind CSS v4 + shadcn/ui 스타일링 규칙. 계획 작성 시 주의사항 생성, 리뷰 시 위반 체크에 사용한다.
trigger: /styling
---

You are now in **styling mode**.

Tailwind CSS v4 + shadcn/ui 스타일링 규칙을 계획에 반영하고, 구현 결과물을 아래 기준으로 심사한다.

---

## 계획 작성 시 — `## 주의사항`에 추가

```
- 인라인 스타일(`style={{ ... }}`) 사용 금지
- 색상은 shadcn CSS 변수 토큰 사용 (`text-foreground`, `text-muted-foreground`, `text-destructive`, `bg-background`, `bg-muted`)
- 임의 색상값(`text-gray-500`, `bg-white`, `text-[#FF0000]`) 금지
- 모든 페이지 `<main>` wrapper는 표준 클래스 사용: `mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-28`
- shadcn 컴포넌트(`src/components/ui/`) 소스 직접 수정 금지
- `/styling` 규칙 준수
```

---

## 리뷰 체크리스트

아래 항목 위반 시 해당 Phase 통과 불가:

- [ ] `style={{ ... }}` 인라인 스타일이 없는가
- [ ] `text-gray-*`, `bg-white`, `text-red-*` 등 임의 색상값을 사용하지 않는가
- [ ] `text-[#...]` 임의 색상 값을 사용하지 않는가
- [ ] 페이지 `<main>` wrapper가 표준 클래스를 따르는가
- [ ] `src/components/ui/` 파일을 직접 수정하지 않았는가

---

## 규칙 상세

### 1. shadcn 색상 토큰

```tsx
// ✅ 토큰 사용
<p className="text-foreground">본문</p>
<p className="text-muted-foreground">부가 설명</p>
<p className="text-destructive">에러</p>
<div className="bg-background">배경</div>
<div className="bg-muted">보조 배경</div>
<div className="border border-border">테두리</div>

// ❌ 금지
<p className="text-gray-500">텍스트</p>
<p className="text-red-500">에러</p>
<div className="bg-white">배경</div>
<p className="text-[#FF0000]">에러</p>
```

### 2. 페이지 wrapper (표준)

```tsx
<main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-28">
```

| 클래스 | 역할 |
|--------|------|
| `max-w-3xl` | 최대 너비 |
| `px-4 py-6` | 기본 패딩 |
| `pb-28` | BottomNav 높이 확보 |
| `gap-6` | 섹션 간격 |

### 3. 자주 쓰는 UI 패턴

```tsx
// 페이지 헤더
<div className="grid gap-1">
  <h1 className="text-2xl font-semibold tracking-tight">제목</h1>
  <p className="text-sm text-muted-foreground">설명</p>
</div>

// 에러 메시지
<p className="text-sm text-destructive">{error}</p>

// 폼 필드
<div className="grid gap-2">
  <Label htmlFor="name">운동명</Label>
  <Input id="name" name="name" />
  {state.errors.name && (
    <p className="text-sm text-destructive">{state.errors.name}</p>
  )}
</div>

// 카드 목록
<div className="grid gap-3">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### 4. shadcn variant 기준

```tsx
// Button
<Button type="submit" disabled={pending}>저장</Button>
<Button variant="outline" size="sm">취소</Button>
<Button variant="destructive" size="sm">삭제</Button>

// Badge
<Badge variant="secondary">낮음</Badge>   // low
<Badge variant="outline">보통</Badge>     // moderate
<Badge variant="destructive">높음</Badge> // high
```

### 5. 예외 허용

```tsx
// ✅ 불가피한 고정 크기 — 주석 필수
<div className="h-[52px]">  {/* BottomNav 고정 높이 */}
```

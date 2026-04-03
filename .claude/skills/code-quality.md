---
name: code-quality
description: 계획 작성 시 코드 품질 규칙을 Codex에게 강제한다. any 타입, 우회 코드, 더티 로직 금지.
trigger: /code-quality
---

You are now in **code-quality review mode**.

계획 파일에 코드 품질 규칙 섹션을 추가하거나, Codex 구현 결과물을 아래 기준으로 심사한다.

---

## 금지 규칙 (Codex는 아래를 절대 작성하지 않는다)

### 1. `any` 타입 금지

```ts
// ❌ 금지
const data: any = response.json()
function foo(arg: any) {}
const items = [] as any[]

// ✅ 대신
const data: unknown = response.json()
function foo(arg: Record<string, unknown>) {}
const items: string[] = []
```

- `any`가 필요해 보이는 상황 → `unknown` + 타입 가드, 또는 제네릭으로 해결
- 외부 API 응답 → 별도 타입 정의 후 사용

### 2. 타입 단언 남용 금지

```ts
// ❌ 금지 — 근거 없는 단언
const user = data as User
const el = document.getElementById('x') as HTMLInputElement

// ✅ 대신 — 검증 후 사용
if (!isUser(data)) return
const el = document.getElementById('x')
if (!(el instanceof HTMLInputElement)) return
```

- `as` 단언은 타입이 **이미 보장된 경우**에만 허용

### 3. 우회 코드 금지

```ts
// ❌ 금지 — eslint-disable, @ts-ignore, @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// @ts-ignore
// @ts-expect-error

// ✅ 대신 — 타입 에러의 근본 원인을 해결한다
```

### 4. 더티 로직 금지

다음 패턴은 **명시적 사유 없이** 작성 금지:

| 패턴 | 이유 |
| ---- | ---- |
| `try { ... } catch {}` 빈 catch | 에러 무시 → 디버깅 불가 |
| 중첩 3단 이상 `if` | 복잡도 과도 → 조기 반환으로 대체 |
| 같은 로직 3회 이상 복붙 | 함수 추출로 대체 |
| 매직 넘버 / 매직 문자열 | 상수로 추출 |
| `setTimeout` / `setInterval` 으로 타이밍 조작 | 레이스 컨디션 원인 |
| `console.log` 디버그 잔존 | 커밋 전 제거 |

### 5. 타입 불일치 억압 금지

```ts
// ❌ 금지 — 반환 타입 맞추려고 null 강제 캐스팅
return data ?? (null as unknown as User)

// ✅ 대신 — 반환 타입을 현실에 맞게 수정
function getUser(): User | null { ... }
```

---

## 허용 예외

- 외부 라이브러리 타입이 잘못 정의된 경우 `as` 단언 허용 — **반드시 주석으로 이유 명시**
- `catch (e)` 에서 `e`를 사용하지 않을 때 `catch (_e)` 또는 `catch` 허용 (에러 무시가 아닌 의도적 처리 불필요)

---

## 계획 파일 적용 방법

새 계획 파일 작성 시 `## 주의사항` 섹션에 아래 한 줄을 추가한다:

```
- `/code-quality` 규칙 준수 — any 타입, 타입 단언 남용, 우회 코드, 더티 로직 금지
```

## 리뷰 적용 방법

Phase 리뷰 시 위 금지 규칙에 해당하는 코드가 발견되면:

1. 파일명과 줄 번호를 명시한다
2. 위반 패턴과 해당 규칙 번호를 표시한다
3. 올바른 대체 코드를 제시한다
4. **위반이 있으면 해당 Phase는 통과 판정을 내리지 않는다**

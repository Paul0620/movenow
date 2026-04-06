# Database Schema

## 플랫폼

Supabase (PostgreSQL) — 인증 없음, 개인 사용 전용

---

## ORM / 스키마 관리

**Drizzle ORM** 사용 (Phase 9 전환).

| 항목 | 내용 |
| ---- | ---- |
| 스키마 정의 | `src/lib/db/schema.ts` — 단일 진실 공급원 |
| DB 반영 | `pnpm db:push` (drizzle-kit push) |
| 타입 | `InferSelectModel<typeof table>` 로 자동 추론 |
| DB 연결 | `src/lib/db/index.ts` — Transaction pooler (port 6543) |
| 환경변수 | `DATABASE_URL` (Supabase Connection String) |

### supabase/schema.sql 제거 대상

Phase 9 이전에 수동 SQL로 관리되던 `supabase/schema.sql`은 Drizzle 스키마로 대체되어 **제거 대상**이다.

### updated_at 트리거 처리 방침

`supabase/schema.sql`에 정의되어 있던 `updated_at` 자동 갱신 DB 트리거는 Drizzle 스키마에 포함하지 않는다.

**이유:** `upsertProfile` 쿼리([src/lib/db/queries/profiles.ts](../src/lib/db/queries/profiles.ts))에서 `updated_at: new Date().toISOString()`을 직접 설정하므로 애플리케이션 레벨에서 처리 가능. DB 트리거 의존성을 줄여 Drizzle 스키마가 단일 진실 공급원이 되도록 유지한다.

---

## 테이블 정의

### profiles (신체 정보)

| 컬럼           | 타입        | 설명                                                              |
| -------------- | ----------- | ----------------------------------------------------------------- |
| id             | uuid (PK)   | 기본 키                                                           |
| height         | numeric     | 키 (cm)                                                           |
| weight         | numeric     | 몸무게 (kg)                                                       |
| age            | integer     | 나이                                                              |
| gender         | text        | 'male' \| 'female'                                                |
| goal           | text        | 'loss' \| 'gain' \| 'maintain'                                    |
| activity_level | text        | 'sedentary' \| 'light' \| 'moderate' \| 'active' \| 'very_active' |
| created_at     | timestamptz | 생성일                                                            |
| updated_at     | timestamptz | 수정일                                                            |

→ 계산 값 (DB 저장 안 함, 조회 시 실시간 계산)

- BMR: Mifflin-St Jeor 공식
- TDEE: BMR × 활동량 계수
- 일일 권장 칼로리 / 단백질(g) / 운동시간(분)

---

### workout_logs (운동 기록)

| 컬럼             | 타입        | 설명                             |
| ---------------- | ----------- | -------------------------------- |
| id               | uuid (PK)   | 기본 키                          |
| date             | date        | 운동 날짜                        |
| exercise_name    | text        | 운동명 (wger API 또는 직접 입력) |
| duration_minutes | integer     | 운동 시간 (분)                   |
| intensity        | text        | 'low' \| 'moderate' \| 'high'    |
| sets             | integer     | 세트 수 (선택)                   |
| reps             | integer     | 횟수 (선택)                      |
| weight_kg        | numeric     | 무게 (선택, 근력 운동용)         |
| calories_burned  | integer     | 소모 칼로리 (MET 자동 계산)      |
| met_value        | numeric     | MET 값 (wger API에서 가져옴)     |
| notes            | text        | 메모 (선택)                      |
| created_at       | timestamptz | 생성일                           |

---

### diet_logs (식단 기록)

| 컬럼       | 타입        | 설명                                          |
| ---------- | ----------- | --------------------------------------------- |
| id         | uuid (PK)   | 기본 키                                       |
| date       | date        | 식사 날짜                                     |
| meal_time  | text        | 'breakfast' \| 'lunch' \| 'dinner' \| 'snack' |
| food_name  | text        | 음식명                                        |
| calories   | integer     | 칼로리 (kcal)                                 |
| protein_g  | numeric     | 단백질 (g)                                    |
| carbs_g    | numeric     | 탄수화물 (g)                                  |
| fat_g      | numeric     | 지방 (g)                                      |
| amount_g   | numeric     | 섭취량 (g, 선택)                              |
| created_at | timestamptz | 생성일                                        |

---

## 계산 공식

### BMR (Mifflin-St Jeor)

```
남성: (10 × 체중kg) + (6.25 × 키cm) - (5 × 나이) + 5
여성: (10 × 체중kg) + (6.25 × 키cm) - (5 × 나이) - 161
```

### TDEE

```
sedentary:   BMR × 1.2
light:       BMR × 1.375
moderate:    BMR × 1.55
active:      BMR × 1.725
very_active: BMR × 1.9
```

### 운동 칼로리 (MET)

```
칼로리 = MET × 체중(kg) × 운동시간(h)
```

### 권장 단백질

```
감량: 체중 × 2.0g
증량: 체중 × 2.2g
유지: 체중 × 1.6g
```

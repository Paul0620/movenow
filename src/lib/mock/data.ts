import type { DietLog, Profile, WorkoutLog } from '@/types'

export const MOCK_PROFILE: Profile = {
  id: 'mock-profile-id',
  height: 175,
  weight: 72,
  age: 28,
  gender: 'male',
  goal: 'maintain',
  activity_level: 'moderate',
  created_at: '2026-03-01T00:00:00Z',
  updated_at: '2026-03-01T00:00:00Z',
}

// 오늘 기준 30일치 날짜 생성 (YYYY-MM-DD)
function generateDates(days: number): string[] {
  const today = new Date('2026-04-06')
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (days - 1 - i))
    return d.toISOString().slice(0, 10)
  })
}

const DATES = generateDates(30)

const WORKOUTS: Array<{
  name: string
  duration: number
  intensity: WorkoutLog['intensity']
  met: number
  sets?: number
  reps?: number
  weightKg?: number
}> = [
  { name: '러닝', duration: 35, intensity: 'moderate', met: 8.0 },
  { name: '헬스 (가슴)', duration: 50, intensity: 'high', met: 6.0, sets: 4, reps: 10, weightKg: 60 },
  { name: '사이클', duration: 40, intensity: 'moderate', met: 7.5 },
  { name: '수영', duration: 45, intensity: 'high', met: 8.3 },
  { name: '헬스 (등)', duration: 55, intensity: 'high', met: 6.0, sets: 4, reps: 8, weightKg: 55 },
  { name: '요가', duration: 60, intensity: 'low', met: 3.0 },
  { name: '줄넘기', duration: 20, intensity: 'high', met: 10.0 },
  { name: '헬스 (하체)', duration: 50, intensity: 'high', met: 6.0, sets: 4, reps: 12, weightKg: 80 },
  { name: '빠르게 걷기', duration: 45, intensity: 'low', met: 4.5 },
]

// 칼로리 소모 계산 (MET × 체중 × 시간h)
function calcBurned(met: number, durationMin: number): number {
  return Math.round(met * MOCK_PROFILE.weight * (durationMin / 60))
}

// 30일 중 약 20일에 운동 (주 4~5회 패턴)
const WORKOUT_DAY_INDICES = [0, 1, 3, 4, 7, 8, 10, 11, 14, 15, 17, 18, 21, 22, 24, 25, 27, 28, 29]

export const MOCK_WORKOUT_LOGS: WorkoutLog[] = WORKOUT_DAY_INDICES.map((dayIdx, i) => {
  const w = WORKOUTS[i % WORKOUTS.length]
  return {
    id: `mock-workout-${dayIdx}`,
    date: DATES[dayIdx],
    exercise_name: w.name,
    duration_minutes: w.duration,
    intensity: w.intensity,
    met_value: w.met,
    sets: w.sets ?? null,
    reps: w.reps ?? null,
    weight_kg: w.weightKg ?? null,
    calories_burned: calcBurned(w.met, w.duration),
    notes: null,
    created_at: `${DATES[dayIdx]}T09:00:00Z`,
  }
})

const MEALS: Array<{
  mealTime: DietLog['meal_time']
  foodName: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}> = [
  { mealTime: 'breakfast', foodName: '오트밀 + 바나나', calories: 380, proteinG: 12, carbsG: 65, fatG: 6 },
  { mealTime: 'breakfast', foodName: '계란 토스트', calories: 420, proteinG: 18, carbsG: 45, fatG: 14 },
  { mealTime: 'lunch', foodName: '닭가슴살 샐러드', calories: 520, proteinG: 42, carbsG: 28, fatG: 12 },
  { mealTime: 'lunch', foodName: '현미밥 + 된장찌개', calories: 610, proteinG: 22, carbsG: 95, fatG: 8 },
  { mealTime: 'lunch', foodName: '삼겹살 + 쌈', calories: 780, proteinG: 35, carbsG: 30, fatG: 48 },
  { mealTime: 'dinner', foodName: '연어 스테이크 + 채소', calories: 580, proteinG: 45, carbsG: 15, fatG: 28 },
  { mealTime: 'dinner', foodName: '닭볶음탕 + 밥', calories: 650, proteinG: 38, carbsG: 72, fatG: 16 },
  { mealTime: 'snack', foodName: '그릭 요거트 + 견과류', calories: 210, proteinG: 14, carbsG: 18, fatG: 10 },
  { mealTime: 'snack', foodName: '프로틴 쉐이크', calories: 180, proteinG: 25, carbsG: 8, fatG: 3 },
]

let dietIdCounter = 0

function makeDietLog(dayIdx: number, mealIdx: number): DietLog {
  const m = MEALS[mealIdx % MEALS.length]
  dietIdCounter++
  return {
    id: `mock-diet-${dietIdCounter}`,
    date: DATES[dayIdx],
    meal_time: m.mealTime,
    food_name: m.foodName,
    calories: m.calories,
    protein_g: m.proteinG,
    carbs_g: m.carbsG,
    fat_g: m.fatG,
    amount_g: null,
    created_at: `${DATES[dayIdx]}T12:00:00Z`,
  }
}

// 30일 모두 식단 기록 (하루 3~4개)
export const MOCK_DIET_LOGS: DietLog[] = DATES.flatMap((_, dayIdx) => {
  const base = dayIdx * 3
  const hasSnack = dayIdx % 3 !== 0
  const logs = [
    makeDietLog(dayIdx, base),
    makeDietLog(dayIdx, base + 1),
    makeDietLog(dayIdx, base + 2),
  ]
  if (hasSnack) logs.push(makeDietLog(dayIdx, base + 3))
  return logs
})

import type { Profile } from '@/types'

type BmrProfile = Pick<Profile, 'weight' | 'height' | 'age' | 'gender'>
type TdeeProfile = Pick<Profile, 'weight' | 'height' | 'age' | 'gender' | 'activity_level'>
type ProteinProfile = Pick<Profile, 'weight' | 'goal'>

/** BMR (Mifflin-St Jeor) */
export function calcBMR(profile: BmrProfile): number {
  const base = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age

  return profile.gender === 'male' ? base + 5 : base - 161
}

const ACTIVITY_MULTIPLIER: Record<Profile['activity_level'], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

/** TDEE = BMR × 활동 계수 */
export function calcTDEE(profile: TdeeProfile): number {
  return Math.round(calcBMR(profile) * ACTIVITY_MULTIPLIER[profile.activity_level])
}

const PROTEIN_MULTIPLIER: Record<Profile['goal'], number> = {
  loss: 2.0,
  gain: 2.2,
  maintain: 1.6,
}

/** 일일 권장 단백질 (g) */
export function calcProteinGoal(profile: ProteinProfile): number {
  return Math.round(profile.weight * PROTEIN_MULTIPLIER[profile.goal])
}

/** 운동 칼로리 소모 = MET × 체중(kg) × 시간(h) */
export function calcCaloriesBurned(
  metValue: number,
  weightKg: number,
  durationMinutes: number,
): number {
  return Math.round(metValue * weightKg * (durationMinutes / 60))
}

/** 일일 권장 운동 시간 (분) — 목표별 */
export function calcWorkoutGoalMinutes(goal: Profile['goal']): number {
  if (goal === 'loss') return 60
  if (goal === 'gain') return 45

  return 30
}

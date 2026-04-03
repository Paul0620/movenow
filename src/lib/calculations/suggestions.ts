import { calcProteinGoal, calcTDEE, calcWorkoutGoalMinutes } from '@/lib/calculations'
import type { DietLog, Profile, WorkoutLog } from '@/types'

export type Suggestion = {
  type: 'protein' | 'workout_time' | 'calories' | 'no_workout'
  message: string
  priority: number
}

type SuggestionInput = {
  profile: Profile
  todayWorkoutLogs: WorkoutLog[]
  todayDietLogs: DietLog[]
  recentWorkoutDates: string[]
}

function getRecentDates(days: number, baseDate: Date) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() - index)

    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  })
}

export function calcSuggestions(input: SuggestionInput): Suggestion[] {
  const suggestions: Suggestion[] = []
  const todayProtein = input.todayDietLogs.reduce((sum, log) => sum + log.protein_g, 0)
  const todayCalories = input.todayDietLogs.reduce((sum, log) => sum + log.calories, 0)
  const todayWorkoutMinutes = input.todayWorkoutLogs.reduce(
    (sum, log) => sum + log.duration_minutes,
    0,
  )

  const proteinGoal = calcProteinGoal(input.profile)
  const workoutGoal = calcWorkoutGoalMinutes(input.profile.goal)
  const calorieGoal = calcTDEE(input.profile)

  const recentThreeDays = getRecentDates(3, new Date())
  const recentWorkoutSet = new Set(input.recentWorkoutDates)
  const hasWorkoutInRecentThreeDays = recentThreeDays.some((date) => recentWorkoutSet.has(date))

  if (!hasWorkoutInRecentThreeDays) {
    suggestions.push({
      type: 'no_workout',
      message: '최근 3일간 운동 기록이 없어요',
      priority: 1,
    })
  }

  if (todayProtein < proteinGoal * 0.8) {
    suggestions.push({
      type: 'protein',
      message: `단백질이 부족해요 (-${Math.max(0, Math.ceil(proteinGoal - todayProtein))}g)`,
      priority: 2,
    })
  }

  if (todayWorkoutMinutes < workoutGoal) {
    suggestions.push({
      type: 'workout_time',
      message: `오늘 운동이 부족해요 (-${Math.max(0, workoutGoal - todayWorkoutMinutes)}분)`,
      priority: 3,
    })
  }

  if (todayCalories > calorieGoal) {
    suggestions.push({
      type: 'calories',
      message: `오늘 칼로리를 초과했어요 (+${todayCalories - calorieGoal}kcal)`,
      priority: 4,
    })
  }

  return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 2)
}

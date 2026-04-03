import { calcProteinGoal, calcTDEE, calcWorkoutGoalMinutes } from '@/lib/calculations'
import type { DietLog, Profile, WorkoutLog } from '@/types'

export type DailyWorkoutSummary = {
  date: string
  totalMinutes: number
  totalCaloriesBurned: number
}

export type DailyDietSummary = {
  date: string
  totalCalories: number
  totalProteinG: number
}

export type DailyGoalStatus = {
  date: string
  caloriesAchieved: boolean
  proteinAchieved: boolean
  workoutAchieved: boolean
}

function sortDatesAscending<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => a.date.localeCompare(b.date))
}

export function aggregateWorkoutByDate(logs: WorkoutLog[]): DailyWorkoutSummary[] {
  const byDate = new Map<string, DailyWorkoutSummary>()

  for (const log of logs) {
    const current = byDate.get(log.date) ?? {
      date: log.date,
      totalMinutes: 0,
      totalCaloriesBurned: 0,
    }

    current.totalMinutes += log.duration_minutes
    current.totalCaloriesBurned += log.calories_burned
    byDate.set(log.date, current)
  }

  return sortDatesAscending(Array.from(byDate.values()))
}

export function aggregateDietByDate(logs: DietLog[]): DailyDietSummary[] {
  const byDate = new Map<string, DailyDietSummary>()

  for (const log of logs) {
    const current = byDate.get(log.date) ?? {
      date: log.date,
      totalCalories: 0,
      totalProteinG: 0,
    }

    current.totalCalories += log.calories
    current.totalProteinG += log.protein_g
    byDate.set(log.date, current)
  }

  return sortDatesAscending(Array.from(byDate.values()))
}

export function calcDailyGoalStatus(
  dates: string[],
  workoutSummaries: DailyWorkoutSummary[],
  dietSummaries: DailyDietSummary[],
  profile: Profile,
): DailyGoalStatus[] {
  const workoutByDate = new Map(workoutSummaries.map((summary) => [summary.date, summary]))
  const dietByDate = new Map(dietSummaries.map((summary) => [summary.date, summary]))
  const calorieGoal = calcTDEE(profile)
  const proteinGoal = calcProteinGoal(profile) * 0.8
  const workoutGoal = calcWorkoutGoalMinutes(profile.goal)

  return dates.map((date) => {
    const workout = workoutByDate.get(date)
    const diet = dietByDate.get(date)

    return {
      date,
      caloriesAchieved: (diet?.totalCalories ?? 0) <= calorieGoal,
      proteinAchieved: (diet?.totalProteinG ?? 0) >= proteinGoal,
      workoutAchieved: (workout?.totalMinutes ?? 0) >= workoutGoal,
    }
  })
}

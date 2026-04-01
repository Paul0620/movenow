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

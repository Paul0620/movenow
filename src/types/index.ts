import type { InferSelectModel } from 'drizzle-orm'

import type { dietLogs, profiles, workoutLogs } from '@/lib/db/schema'

export type Goal = 'loss' | 'gain' | 'maintain'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Intensity = 'low' | 'moderate' | 'high'
export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type Profile = InferSelectModel<typeof profiles>
export type WorkoutLog = InferSelectModel<typeof workoutLogs>
export type DietLog = InferSelectModel<typeof dietLogs>

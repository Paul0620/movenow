'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { calcCaloriesBurned } from '@/lib/calculations'
import { getProfile } from '@/lib/db/queries/profiles'
import { createWorkoutLog, deleteWorkoutLog } from '@/lib/db/queries/workout'

const optionalInt = z.preprocess((value) => {
  if (value === '' || value === null) return undefined
  return value
}, z.coerce.number().int().min(1).optional())

const optionalNumber = z.preprocess((value) => {
  if (value === '' || value === null) return undefined
  return value
}, z.coerce.number().min(0).optional())

const optionalString = z.preprocess((value) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}, z.string().max(500).optional())

const WorkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exercise_name: z.string().trim().min(1).max(100),
  duration_minutes: z.coerce.number().int().min(1).max(600),
  intensity: z.enum(['low', 'moderate', 'high']),
  met_value: z.coerce.number().min(0.1).max(30),
  sets: optionalInt,
  reps: optionalInt,
  weight_kg: optionalNumber,
  notes: optionalString,
})

type WorkoutFieldErrors = Partial<
  Record<
    | 'date'
    | 'exercise_name'
    | 'duration_minutes'
    | 'intensity'
    | 'met_value'
    | 'sets'
    | 'reps'
    | 'weight_kg'
    | 'notes',
    string
  >
>

export type CreateWorkoutState = {
  error: string | null
  success: boolean
  errors: WorkoutFieldErrors
}

export async function createWorkoutAction(
  prevState: CreateWorkoutState,
  formData: FormData,
): Promise<CreateWorkoutState> {
  const parsed = WorkoutSchema.safeParse({
    date: formData.get('date'),
    exercise_name: formData.get('exercise_name'),
    duration_minutes: formData.get('duration_minutes'),
    intensity: formData.get('intensity'),
    met_value: formData.get('met_value'),
    sets: formData.get('sets'),
    reps: formData.get('reps'),
    weight_kg: formData.get('weight_kg'),
    notes: formData.get('notes'),
  })

  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors

    return {
      error: '입력값을 다시 확인해주세요.',
      success: false,
      errors: {
        date: fieldErrors.date?.[0],
        exercise_name: fieldErrors.exercise_name?.[0],
        duration_minutes: fieldErrors.duration_minutes?.[0],
        intensity: fieldErrors.intensity?.[0],
        met_value: fieldErrors.met_value?.[0],
        sets: fieldErrors.sets?.[0],
        reps: fieldErrors.reps?.[0],
        weight_kg: fieldErrors.weight_kg?.[0],
        notes: fieldErrors.notes?.[0],
      },
    }
  }

  const profileResult = await getProfile()

  if (profileResult.error) {
    return {
      error: profileResult.error,
      success: false,
      errors: {},
    }
  }

  if (!profileResult.data) {
    return {
      error: '프로필을 먼저 저장해야 칼로리를 계산할 수 있습니다.',
      success: false,
      errors: {},
    }
  }

  const caloriesBurned = calcCaloriesBurned(
    parsed.data.met_value,
    profileResult.data.weight,
    parsed.data.duration_minutes,
  )

  const result = await createWorkoutLog({
    ...parsed.data,
    calories_burned: caloriesBurned,
    sets: parsed.data.sets ?? null,
    reps: parsed.data.reps ?? null,
    weight_kg: parsed.data.weight_kg ?? null,
    notes: parsed.data.notes ?? null,
  })

  if (result.error) {
    return {
      error: result.error,
      success: false,
      errors: {},
    }
  }

  revalidatePath('/workout')

  return {
    error: null,
    success: true,
    errors: {},
  }
}

export async function deleteWorkoutAction(id: string): Promise<{ error: string | null }> {
  const result = await deleteWorkoutLog(id)

  if (result.error) {
    return { error: result.error }
  }

  revalidatePath('/workout')

  return { error: null }
}

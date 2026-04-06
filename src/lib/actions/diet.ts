'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createDietLog, deleteDietLog } from '@/lib/db/queries/diet'

const optionalAmount = z.preprocess((value) => {
  if (value === '' || value === null) return undefined
  return value
}, z.coerce.number().min(1).max(5000).optional())

const DietSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal_time: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  food_name: z.string().trim().min(1).max(100),
  calories: z.coerce.number().int().min(0).max(5000),
  protein_g: z.coerce.number().min(0).max(500),
  carbs_g: z.coerce.number().min(0).max(500),
  fat_g: z.coerce.number().min(0).max(500),
  amount_g: optionalAmount,
})

type DietFieldErrors = Partial<
  Record<
    | 'date'
    | 'meal_time'
    | 'food_name'
    | 'calories'
    | 'protein_g'
    | 'carbs_g'
    | 'fat_g'
    | 'amount_g',
    string
  >
>

export type CreateDietState = {
  error: string | null
  success: boolean
  errors: DietFieldErrors
}

function roundMacro(value: number) {
  return Math.round(value * 10) / 10
}

export async function createDietAction(
  prevState: CreateDietState,
  formData: FormData,
): Promise<CreateDietState> {
  const parsed = DietSchema.safeParse({
    date: formData.get('date'),
    meal_time: formData.get('meal_time'),
    food_name: formData.get('food_name'),
    calories: formData.get('calories'),
    protein_g: formData.get('protein_g'),
    carbs_g: formData.get('carbs_g'),
    fat_g: formData.get('fat_g'),
    amount_g: formData.get('amount_g'),
  })

  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors

    return {
      error: '입력값을 다시 확인해주세요.',
      success: false,
      errors: {
        date: fieldErrors.date?.[0],
        meal_time: fieldErrors.meal_time?.[0],
        food_name: fieldErrors.food_name?.[0],
        calories: fieldErrors.calories?.[0],
        protein_g: fieldErrors.protein_g?.[0],
        carbs_g: fieldErrors.carbs_g?.[0],
        fat_g: fieldErrors.fat_g?.[0],
        amount_g: fieldErrors.amount_g?.[0],
      },
    }
  }

  const ratio = parsed.data.amount_g ? parsed.data.amount_g / 100 : 1

  const result = await createDietLog({
    ...parsed.data,
    calories: Math.round(parsed.data.calories * ratio),
    protein_g: roundMacro(parsed.data.protein_g * ratio),
    carbs_g: roundMacro(parsed.data.carbs_g * ratio),
    fat_g: roundMacro(parsed.data.fat_g * ratio),
    amount_g: parsed.data.amount_g ?? null,
  })

  if (result.error) {
    return {
      error: result.error,
      success: false,
      errors: {},
    }
  }

  revalidatePath('/diet')

  return {
    error: null,
    success: true,
    errors: {},
  }
}

export async function deleteDietAction(id: string): Promise<{ error: string | null }> {
  const result = await deleteDietLog(id)

  if (result.error) {
    return { error: result.error }
  }

  revalidatePath('/diet')

  return { error: null }
}

'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getProfile, upsertProfile } from '@/lib/db/queries/profiles'
import type { Profile } from '@/types'

const ProfileSchema = z.object({
  height: z.coerce.number().min(100).max(250),
  weight: z.coerce.number().min(20).max(300),
  age: z.coerce.number().int().min(10).max(120),
  gender: z.enum(['male', 'female']),
  goal: z.enum(['loss', 'gain', 'maintain']),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
})

type ProfileFieldErrors = Partial<
  Record<'height' | 'weight' | 'age' | 'gender' | 'goal' | 'activity_level', string>
>

export type SaveProfileState = {
  error: string | null
  errors: ProfileFieldErrors
  success: boolean
  profile?: Profile
}

export async function saveProfileAction(
  prevState: SaveProfileState,
  formData: FormData,
): Promise<SaveProfileState> {
  const parsed = ProfileSchema.safeParse({
    height: formData.get('height'),
    weight: formData.get('weight'),
    age: formData.get('age'),
    gender: formData.get('gender'),
    goal: formData.get('goal'),
    activity_level: formData.get('activity_level'),
  })

  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors

    return {
      error: '입력값을 다시 확인해주세요.',
      errors: {
        height: fieldErrors.height?.[0],
        weight: fieldErrors.weight?.[0],
        age: fieldErrors.age?.[0],
        gender: fieldErrors.gender?.[0],
        goal: fieldErrors.goal?.[0],
        activity_level: fieldErrors.activity_level?.[0],
      },
      success: false,
      profile: prevState.profile,
    }
  }

  const existingProfile = await getProfile()

  if (existingProfile.error) {
    return {
      error: existingProfile.error,
      errors: {},
      success: false,
      profile: prevState.profile,
    }
  }

  const result = await upsertProfile(parsed.data, existingProfile.data?.id)

  if (result.error || !result.data) {
    return {
      error: result.error ?? '프로필 저장에 실패했습니다.',
      errors: {},
      success: false,
      profile: prevState.profile,
    }
  }

  revalidatePath('/profile')

  return {
    error: null,
    errors: {},
    success: true,
    profile: result.data,
  }
}

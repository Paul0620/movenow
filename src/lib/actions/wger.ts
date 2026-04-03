'use server'

import { getExerciseMet, searchExercises, type WgerExercise } from '@/lib/wger'

export async function searchExercisesAction(term: string): Promise<WgerExercise[]> {
  return searchExercises(term)
}

export async function getExerciseMetAction(id: number): Promise<number | null> {
  return getExerciseMet(id)
}

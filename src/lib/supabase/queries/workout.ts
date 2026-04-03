import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { WorkoutLog } from '@/types'

type WorkoutLogInput = Omit<WorkoutLog, 'id' | 'created_at'>

/** 날짜별 운동 기록 조회 */
export async function getWorkoutLogs(
  date?: string,
): Promise<{ data: WorkoutLog[]; error: string | null }> {
  const supabase = await createClient()
  let query = supabase.from('workout_logs').select('*').order('created_at', { ascending: false })

  if (date) {
    query = query.eq('date', date)
  }

  const { data, error } = await query

  return { data: data ?? [], error: error?.message ?? null }
}

/** 운동 기록 추가 */
export async function createWorkoutLog(
  log: WorkoutLogInput,
): Promise<{ data: WorkoutLog | null; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('workout_logs').insert(log).select().single()

  return { data: data ?? null, error: error?.message ?? null }
}

/** 운동 기록 삭제 */
export async function deleteWorkoutLog(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from('workout_logs').delete().eq('id', id)

  return { error: error?.message ?? null }
}

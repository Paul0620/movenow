import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { DietLog } from '@/types'

type DietLogInput = Omit<DietLog, 'id' | 'created_at'>

/** 날짜별 식단 기록 조회 */
export async function getDietLogs(
  date?: string,
): Promise<{ data: DietLog[]; error: string | null }> {
  const supabase = await createClient()
  let query = supabase.from('diet_logs').select('*').order('created_at', { ascending: false })

  if (date) {
    query = query.eq('date', date)
  }

  const { data, error } = await query

  return { data: data ?? [], error: error?.message ?? null }
}

/** 식단 기록 추가 */
export async function createDietLog(
  log: DietLogInput,
): Promise<{ data: DietLog | null; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('diet_logs').insert(log).select().single()

  return { data: data ?? null, error: error?.message ?? null }
}

/** 식단 기록 삭제 */
export async function deleteDietLog(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from('diet_logs').delete().eq('id', id)

  return { error: error?.message ?? null }
}

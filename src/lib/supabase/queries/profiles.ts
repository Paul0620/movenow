import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

type ProfileInput = Omit<Profile, 'id' | 'created_at' | 'updated_at'>

/** 프로필 조회 (첫 번째 행) */
export async function getProfile(): Promise<{ data: Profile | null; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return { data: data ?? null, error: error?.message ?? null }
}

/** 프로필 생성 또는 업데이트 (id 있으면 update, 없으면 insert) */
export async function upsertProfile(
  profile: ProfileInput,
  id?: string,
): Promise<{ data: Profile | null; error: string | null }> {
  const supabase = await createClient()

  if (id) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', id)
      .select()
      .single()

    return { data: data ?? null, error: error?.message ?? null }
  }

  const { data, error } = await supabase.from('profiles').insert(profile).select().single()

  return { data: data ?? null, error: error?.message ?? null }
}

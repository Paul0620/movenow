import 'server-only'

import { desc, eq } from 'drizzle-orm'

import { getDb } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { MOCK_PROFILE } from '@/lib/mock/data'
import type { Profile } from '@/types'

type ProfileInput = Omit<Profile, 'id' | 'created_at' | 'updated_at'>

const isMockMode = !process.env.DATABASE_URL

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
}

export async function getProfile(): Promise<{ data: Profile | null; error: string | null }> {
  if (isMockMode) {
    return { data: MOCK_PROFILE, error: null }
  }

  try {
    const rows = await getDb().select().from(profiles).orderBy(desc(profiles.created_at)).limit(1)

    return { data: rows[0] ?? null, error: null }
  } catch (error) {
    return { data: null, error: toErrorMessage(error) }
  }
}

export async function upsertProfile(
  profile: ProfileInput,
  id?: string,
): Promise<{ data: Profile | null; error: string | null }> {
  if (isMockMode) {
    return {
      data: {
        ...MOCK_PROFILE,
        ...profile,
        id: id ?? MOCK_PROFILE.id,
        updated_at: new Date().toISOString(),
      },
      error: null,
    }
  }

  try {
    if (id) {
      const rows = await getDb()
        .update(profiles)
        .set({ ...profile, updated_at: new Date().toISOString() })
        .where(eq(profiles.id, id))
        .returning()

      return { data: rows[0] ?? null, error: null }
    }

    const rows = await getDb().insert(profiles).values(profile).returning()

    return { data: rows[0] ?? null, error: null }
  } catch (error) {
    return { data: null, error: toErrorMessage(error) }
  }
}

import 'server-only'

import { and, desc, eq, gte, lte } from 'drizzle-orm'

import { getDb } from '@/lib/db'
import { dietLogs } from '@/lib/db/schema'
import { MOCK_DIET_LOGS } from '@/lib/mock/data'
import type { DietLog } from '@/types'

type DietLogInput = Omit<DietLog, 'id' | 'created_at'>
type GetDietLogsOptions = {
  date?: string
  from?: string
  to?: string
}

const isMockMode = !process.env.DATABASE_URL

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
}

function buildFilters(options?: GetDietLogsOptions) {
  const filters = []

  if (options?.date) {
    filters.push(eq(dietLogs.date, options.date))
  }

  if (options?.from) {
    filters.push(gte(dietLogs.date, options.from))
  }

  if (options?.to) {
    filters.push(lte(dietLogs.date, options.to))
  }

  return filters
}

export async function getDietLogs(
  options?: GetDietLogsOptions,
): Promise<{ data: DietLog[]; error: string | null }> {
  if (isMockMode) {
    let logs = MOCK_DIET_LOGS
    const from = options?.from
    const to = options?.to

    if (options?.date) logs = logs.filter((log) => log.date === options.date)
    if (from) logs = logs.filter((log) => log.date >= from)
    if (to) logs = logs.filter((log) => log.date <= to)

    return { data: logs, error: null }
  }

  try {
    const filters = buildFilters(options)
    const baseQuery = getDb().select().from(dietLogs)
    const rows =
      filters.length > 0
        ? await baseQuery.where(and(...filters)).orderBy(desc(dietLogs.created_at))
        : await baseQuery.orderBy(desc(dietLogs.created_at))

    return { data: rows, error: null }
  } catch (error) {
    return { data: [], error: toErrorMessage(error) }
  }
}

export async function createDietLog(
  log: DietLogInput,
): Promise<{ data: DietLog | null; error: string | null }> {
  if (isMockMode) {
    return {
      data: {
        ...log,
        id: `mock-diet-new-${Date.now()}`,
        created_at: new Date().toISOString(),
      },
      error: null,
    }
  }

  try {
    const rows = await getDb().insert(dietLogs).values(log).returning()

    return { data: rows[0] ?? null, error: null }
  } catch (error) {
    return { data: null, error: toErrorMessage(error) }
  }
}

export async function deleteDietLog(id: string): Promise<{ error: string | null }> {
  if (isMockMode) {
    return { error: null }
  }

  try {
    await getDb().delete(dietLogs).where(eq(dietLogs.id, id))

    return { error: null }
  } catch (error) {
    return { error: toErrorMessage(error) }
  }
}

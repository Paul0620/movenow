import 'server-only'

import { and, desc, eq, gte, lte } from 'drizzle-orm'

import { getDb } from '@/lib/db'
import { workoutLogs } from '@/lib/db/schema'
import { MOCK_WORKOUT_LOGS } from '@/lib/mock/data'
import type { WorkoutLog } from '@/types'

type WorkoutLogInput = Omit<WorkoutLog, 'id' | 'created_at'>
type GetWorkoutLogsOptions = {
  date?: string
  from?: string
  to?: string
}

const isMockMode = !process.env.DATABASE_URL

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
}

function buildFilters(options?: GetWorkoutLogsOptions) {
  const filters = []

  if (options?.date) {
    filters.push(eq(workoutLogs.date, options.date))
  }

  if (options?.from) {
    filters.push(gte(workoutLogs.date, options.from))
  }

  if (options?.to) {
    filters.push(lte(workoutLogs.date, options.to))
  }

  return filters
}

export async function getWorkoutLogs(
  options?: GetWorkoutLogsOptions,
): Promise<{ data: WorkoutLog[]; error: string | null }> {
  if (isMockMode) {
    let logs = MOCK_WORKOUT_LOGS
    const from = options?.from
    const to = options?.to

    if (options?.date) logs = logs.filter((log) => log.date === options.date)
    if (from) logs = logs.filter((log) => log.date >= from)
    if (to) logs = logs.filter((log) => log.date <= to)

    return { data: logs, error: null }
  }

  try {
    const filters = buildFilters(options)
    const baseQuery = getDb().select().from(workoutLogs)
    const rows =
      filters.length > 0
        ? await baseQuery.where(and(...filters)).orderBy(desc(workoutLogs.created_at))
        : await baseQuery.orderBy(desc(workoutLogs.created_at))

    return { data: rows, error: null }
  } catch (error) {
    return { data: [], error: toErrorMessage(error) }
  }
}

export async function createWorkoutLog(
  log: WorkoutLogInput,
): Promise<{ data: WorkoutLog | null; error: string | null }> {
  if (isMockMode) {
    return {
      data: {
        ...log,
        id: `mock-workout-new-${Date.now()}`,
        created_at: new Date().toISOString(),
      },
      error: null,
    }
  }

  try {
    const rows = await getDb().insert(workoutLogs).values(log).returning()

    return { data: rows[0] ?? null, error: null }
  } catch (error) {
    return { data: null, error: toErrorMessage(error) }
  }
}

export async function deleteWorkoutLog(id: string): Promise<{ error: string | null }> {
  if (isMockMode) {
    return { error: null }
  }

  try {
    await getDb().delete(workoutLogs).where(eq(workoutLogs.id, id))

    return { error: null }
  } catch (error) {
    return { error: toErrorMessage(error) }
  }
}

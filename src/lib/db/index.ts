import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from '@/lib/db/schema'

declare global {
  var __movenowDb__:
    | ReturnType<typeof drizzle<typeof schema>>
    | undefined
  var __movenowSql__: ReturnType<typeof postgres> | undefined
}

function createDb() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL이 설정되지 않았습니다.')
  }

  const client = postgres(connectionString, {
    ssl: 'require',
  })

  return drizzle(client, { schema })
}

export function getDb() {
  if (process.env.NODE_ENV === 'production') {
    return createDb()
  }

  globalThis.__movenowDb__ ??= createDb()

  return globalThis.__movenowDb__
}

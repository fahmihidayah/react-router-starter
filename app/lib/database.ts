import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { databaseRelations } from '~/db/relations'
import { env } from '~/env'
import {
  incrementDatabaseConnectionsClosed,
  incrementDatabaseQueries,
} from '~/features/observability'

export const databaseClient = postgres(env.DATABASE_URL, {
  debug(_connection, query) {
    const operation = /^\s*(\w+)/.exec(query)?.[1]?.toLowerCase() ?? 'unknown'
    incrementDatabaseQueries(operation)
  },
  onclose() {
    incrementDatabaseConnectionsClosed()
  },
})

export const db = drizzle({
  client: databaseClient,
  relations: databaseRelations,
})

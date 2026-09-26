import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { databaseRelations } from '~/db/relations'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

export const databaseClient = postgres(process.env.DATABASE_URL)

export const db = drizzle({
  client: databaseClient,
  relations: databaseRelations,
})

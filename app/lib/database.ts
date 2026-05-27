import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from '~/db/schema'

const client = createClient({
  url: process.env.DATABASE_URL ?? 'file:./app.db',
})

export const db = drizzle({
  client,
  schema,
})

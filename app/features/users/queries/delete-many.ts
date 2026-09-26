import { inArray } from 'drizzle-orm'
import { users } from '~/db/schema'
import { db } from '~/lib/database'

export async function deleteMany(ids: string[]): Promise<void> {
  await db.delete(users).where(inArray(users.id, ids))
}

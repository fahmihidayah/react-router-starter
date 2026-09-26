import { inArray } from 'drizzle-orm'
import { roles } from '~/db/schema'
import { db } from '~/lib/database'

export async function deleteMany(ids: string[]) {
  if (ids.length === 0) return
  await db.delete(roles).where(inArray(roles.id, ids))
}

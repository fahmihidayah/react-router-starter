import { inArray } from 'drizzle-orm'
import { categories } from '~/db/schema'
import { db } from '~/lib/database'

export async function deleteMany(ids: string[]): Promise<void> {
  if (ids.length === 0) return

  await db.delete(categories).where(inArray(categories.id, ids))
}

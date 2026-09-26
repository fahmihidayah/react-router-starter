import { eq, inArray } from 'drizzle-orm'
import { media } from '~/db/schema'
import { db } from '~/lib/database'

export async function deleteById(id: string): Promise<void> {
  await db.delete(media).where(eq(media.id, id))
}

export async function deleteMany(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  await db.delete(media).where(inArray(media.id, ids))
}

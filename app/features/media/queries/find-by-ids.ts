import { inArray } from 'drizzle-orm'
import { media, type TMedia } from '~/db/schema'
import { db } from '~/lib/database'

export async function findByIds(ids: string[]): Promise<TMedia[]> {
  if (ids.length === 0) return []
  return db.select().from(media).where(inArray(media.id, ids))
}

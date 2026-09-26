import { inArray } from 'drizzle-orm'
import { posts } from '~/db/schema'
import { db } from '~/lib/database'

export async function deleteMany(ids: string[]): Promise<void> {
  await db.delete(posts).where(inArray(posts.id, ids))
}

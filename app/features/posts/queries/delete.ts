import { eq } from 'drizzle-orm'
import { posts } from '~/db/schema'
import { db } from '~/lib/database'

export async function deleteById(id: string): Promise<void> {
  await db.delete(posts).where(eq(posts.id, id))
}

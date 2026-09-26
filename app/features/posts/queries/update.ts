import { eq } from 'drizzle-orm'
import { posts } from '~/db/schema'
import { db } from '~/lib/database'

export type UpdatePostData = {
  slug?: string
  title?: string
  content?: string
  categoryId?: string
  updatedAt?: Date
}

export async function update(id: string, data: UpdatePostData): Promise<void> {
  await db.update(posts).set(data).where(eq(posts.id, id))
}

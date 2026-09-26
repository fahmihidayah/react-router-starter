import { posts } from '~/db/schema'
import type { TInsertPost } from '~/features/posts/schemas/db/posts'
import { db } from '~/lib/database'

export async function create(data: TInsertPost): Promise<void> {
  await db.insert(posts).values(data)
}

import type { TPost } from '~/features/posts/schemas/db/posts'
import { db } from '~/lib/database'

export async function findById(id: string): Promise<TPost | undefined> {
  return await db.query.posts.findFirst({
    where: { id: id },
  })
}

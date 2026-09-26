import { eq } from 'drizzle-orm'
import { posts } from '~/db/schema'
import type { TPost } from '~/features/posts/schemas/db/posts'
import { db } from '~/lib/database'

export async function findBySlug(slug: string): Promise<TPost | undefined> {
  return await db.query.posts.findFirst({
    where: { slug: slug },
  })
}

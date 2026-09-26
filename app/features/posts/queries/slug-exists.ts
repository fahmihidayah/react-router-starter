import { db } from '~/lib/database'

export async function slugExists(slug: string): Promise<boolean> {
  const result = await db.query.posts.findFirst({
    where: { slug: slug },
    columns: { id: true },
  })
  return !!result
}

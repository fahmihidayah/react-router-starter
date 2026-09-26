import type { TCategory } from '~/db/schema'
import { db } from '~/lib/database'

export async function findByTitle(title: string): Promise<TCategory | undefined> {
  return await db.query.categories.findFirst({
    where: { title: title },
  })
}

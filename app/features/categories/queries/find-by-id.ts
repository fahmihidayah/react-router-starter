import type { TCategory } from '~/db/schema'
import { db } from '~/lib/database'

export async function findById(id: string): Promise<TCategory | undefined> {
  return await db.query.categories.findFirst({
    where: { id: id },
  })
}

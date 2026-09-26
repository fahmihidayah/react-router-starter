import { categories, type TInsertCategory } from '~/db/schema'
import { db } from '~/lib/database'

export async function create(data: TInsertCategory): Promise<string> {
  const [result] = await db.insert(categories).values(data).returning({ id: categories.id })
  return result.id
}

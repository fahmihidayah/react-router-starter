import { eq } from 'drizzle-orm'
import { categories } from '~/db/schema'
import { db } from '~/lib/database'

export async function deleteById(id: string): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id))
}

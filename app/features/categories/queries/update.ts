import { eq } from 'drizzle-orm'
import { categories } from '~/db/schema'
import { db } from '~/lib/database'

export type UpdateCategoryData = {
  title?: string
}

export async function update(id: string, data: UpdateCategoryData): Promise<void> {
  await db
    .update(categories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id))
}

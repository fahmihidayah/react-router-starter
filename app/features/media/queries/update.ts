import { eq } from 'drizzle-orm'
import { media, type TInsertMedia } from '~/db/schema'
import { db } from '~/lib/database'

export async function update(
  id: string,
  data: Partial<Omit<TInsertMedia, 'id' | 'createdAt'>>,
): Promise<void> {
  await db
    .update(media)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(media.id, id))
}

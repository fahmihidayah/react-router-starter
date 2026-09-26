import { media, type TInsertMedia } from '~/db/schema'
import { db } from '~/lib/database'

export async function create(data: TInsertMedia): Promise<string> {
  const [result] = await db.insert(media).values(data).returning({ id: media.id })
  return result.id
}

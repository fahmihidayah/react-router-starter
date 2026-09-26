import type { TMedia } from '~/db/schema'
import { db } from '~/lib/database'

export async function findById(id: string): Promise<TMedia | undefined> {
  return db.query.media.findFirst({ where: { id } })
}

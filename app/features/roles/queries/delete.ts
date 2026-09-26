import { eq } from 'drizzle-orm'
import { roles } from '~/db/schema'
import { db } from '~/lib/database'

export async function deleteById(id: string) {
  await db.delete(roles).where(eq(roles.id, id))
}

import { eq } from 'drizzle-orm'
import { users } from '~/db/schema'
import { db } from '~/lib/database'

export async function deleteById(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id))
}

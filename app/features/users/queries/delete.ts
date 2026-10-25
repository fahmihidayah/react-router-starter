import { eq } from 'drizzle-orm'
import { auditLogs, users } from '~/db/schema'
import { db } from '~/lib/database'

export async function deleteById(id: string): Promise<void> {
  await db.transaction(async (transaction) => {
    await transaction.delete(auditLogs).where(eq(auditLogs.actorId, id))
    await transaction.delete(users).where(eq(users.id, id))
  })
}

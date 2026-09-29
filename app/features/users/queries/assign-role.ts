import { eq } from 'drizzle-orm'
import { userRoles } from '~/db/schema'
import { db } from '~/lib/database'

/** Replaces every current assignment so a user always has at most one app role. */
export async function assignRole(userId: string, roleId: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(userRoles).where(eq(userRoles.userId, userId))
    await tx.insert(userRoles).values({ userId, roleId })
  })
}

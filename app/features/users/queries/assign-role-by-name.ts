import { eq } from 'drizzle-orm'
import { userRoles } from '~/db/schema'
import { db } from '~/lib/database'

export async function assignRoleByName(userId: string, roleName: string): Promise<void> {
  const role = await db.query.roles.findFirst({
    where: { name: roleName },
  })

  if (!role) return

  await db.transaction(async (tx) => {
    await tx.delete(userRoles).where(eq(userRoles.userId, userId))
    await tx.insert(userRoles).values({ userId, roleId: role.id })
  })
}

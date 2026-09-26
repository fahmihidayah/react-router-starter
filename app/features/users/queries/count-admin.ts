import { eq, sql } from 'drizzle-orm'
import { roles, userRoles } from '~/db/schema'
import { db } from '~/lib/database'

export async function countAdmin(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(distinct ${userRoles.userId})` })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(roles.name, 'Admin'))

  return Number(result[0]?.count ?? 0)
}

import { asc, eq } from 'drizzle-orm'
import { permissions, rolePermissions, type TPermission, userRoles } from '~/db/schema'
import { db } from '~/lib/database'

export async function findForUser(userId: string): Promise<TPermission[]> {
  const rows = await db
    .select({ permission: permissions })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
    .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
    .where(eq(userRoles.userId, userId))
    .orderBy(asc(permissions.key))

  const permissionList = rows.map(({ permission }) => permission)

  console.log('[Permission Debug] findForUser:', {
    userId,
    permissionCount: permissionList.length,
    permissionKeys: permissionList.map((p) => p.key),
  })

  return permissionList
}

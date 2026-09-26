import { and, eq } from 'drizzle-orm'
import { rolePermissions } from '~/db/schema'
import { db } from '~/lib/database'

/**
 * Assign permissions to a role
 * Replaces all existing permissions with the new set
 */
export async function assignPermissions(roleId: string, permissionIds: string[]) {
  await db.transaction(async (tx) => {
    // Remove all existing permissions for this role
    await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId))

    // Add new permissions
    if (permissionIds.length > 0) {
      await tx.insert(rolePermissions).values(
        permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      )
    }
  })
}

/**
 * Add a single permission to a role
 */
export async function addPermission(roleId: string, permissionId: string) {
  await db.insert(rolePermissions).values({ roleId, permissionId }).onConflictDoNothing()
}

/**
 * Remove a single permission from a role
 */
export async function removePermission(roleId: string, permissionId: string) {
  await db
    .delete(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId),
      ),
    )
}

import { randomUUID } from 'node:crypto'
import { roles } from '../app/db/schema'
import {
  PERMISSION_REGISTRY,
  USER_PERMISSION_KEYS,
} from '../app/features/permissions/permission-registry'
import * as permissionService from '../app/features/permissions/services'
import * as roleQueries from '../app/features/roles/queries'
import { db } from '../app/lib/database'

/** Creates or refreshes the immutable application roles. Safe to run repeatedly. */
async function seedSystemRoles() {
  const now = new Date()
  await db
    .insert(roles)
    .values([
      {
        id: randomUUID(),
        key: 'admin',
        name: 'Admin',
        description: 'Administrator with full access',
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        key: 'user',
        name: 'User',
        description: 'Standard application user',
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoUpdate({
      target: roles.key,
      set: {
        isSystem: true,
        updatedAt: now,
      },
    })

  const [adminRole, userRole] = await Promise.all([
    roleQueries.findByKey('admin'),
    roleQueries.findByKey('user'),
  ])
  if (!adminRole || !userRole) throw new Error('System roles could not be seeded')

  return { adminRole, userRole }
}

/** Synchronizes the permission registry and assigns it to the system roles. */
async function seedPermissions(adminRoleId: string, userRoleId: string) {
  const registeredPermissions = await permissionService.syncRegistry()
  const permissionIdsByKey = new Map(
    registeredPermissions.map((permission) => [permission.key, permission.id]),
  )
  const permissionIdsFor = (keys: readonly string[]) =>
    keys.map((key) => {
      const permissionId = permissionIdsByKey.get(key)
      if (!permissionId) throw new Error(`Permission ${key} was not registered`)
      return permissionId
    })

  await roleQueries.assignPermissions(
    adminRoleId,
    permissionIdsFor(PERMISSION_REGISTRY.map(({ key }) => key)),
  )
  await roleQueries.assignPermissions(userRoleId, permissionIdsFor(USER_PERMISSION_KEYS))

  return registeredPermissions.length
}

export type SystemSeedResult = {
  permissionCount: number
  roleCount: number
}

/**
 * Seeds roles and permissions only. This is the only seed that production needs, and it never
 * creates a login, a password, or demo data.
 */
export async function seedSystem(): Promise<SystemSeedResult> {
  const { adminRole, userRole } = await seedSystemRoles()
  const permissionCount = await seedPermissions(adminRole.id, userRole.id)

  return { permissionCount, roleCount: 2 }
}

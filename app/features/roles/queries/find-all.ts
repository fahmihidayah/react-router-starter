import { db } from '~/lib/database'
import type { RoleWithPermissions } from '../types'
import { toRoleWithPermissions } from './utils'

export async function findAll(): Promise<RoleWithPermissions[]> {
  const results = await db.query.roles.findMany({
    orderBy: { name: 'asc' },
    with: {
      rolePermissions: {
        with: {
          permission: true,
        },
      },
    },
  })
  return results.map(toRoleWithPermissions)
}

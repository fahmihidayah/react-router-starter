import { db } from '~/lib/database'
import type { RoleWithPermissions } from '../types'
import { toRoleWithPermissions } from './utils'

export async function findById(id: string): Promise<RoleWithPermissions | undefined> {
  const result = await db.query.roles.findFirst({
    where: { id: id },
    with: {
      rolePermissions: {
        with: {
          permission: true,
        },
      },
    },
  })
  return toRoleWithPermissions(result)
}

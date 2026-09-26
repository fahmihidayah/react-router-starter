import { db } from '~/lib/database'
import type { RoleWithPermissions } from '../types'
import { toRoleWithPermissions } from './utils'

export async function findByName(name: string): Promise<RoleWithPermissions | undefined> {
  const result = await db.query.roles.findFirst({
    where: { name: name },
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

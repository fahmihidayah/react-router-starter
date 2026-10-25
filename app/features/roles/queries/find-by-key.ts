import { db } from '~/lib/database'
import type { RoleWithPermissions } from '../types'
import { toRoleWithPermissions } from './utils'

export async function findByKey(key: string): Promise<RoleWithPermissions | undefined> {
  const result = await db.query.roles.findFirst({
    where: { key },
    with: {
      rolePermissions: {
        with: {
          permission: true,
        },
      },
    },
  })
  return result ? toRoleWithPermissions(result) : undefined
}

import type { TRole, TUser } from '~/db/schema'
import type { UserWithRoles } from '../types'

type UserWithRoleRelations = TUser & { userRoles: Array<{ role: TRole }> }

export function toUserWithRoles(user: undefined): undefined
export function toUserWithRoles(user: UserWithRoleRelations): UserWithRoles
export function toUserWithRoles(
  user: UserWithRoleRelations | undefined,
): UserWithRoles | undefined {
  if (!user) return undefined
  const { userRoles, ...userData } = user
  return {
    ...userData,
    roles: userRoles.map(({ role }) => role),
  }
}

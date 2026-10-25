import type { TRole, TUser } from '~/db/schema'
import type { UserWithRole } from '../types'

type UserWithRoleRelation = TUser & { userRole: { role: TRole } | null }

export function toUserWithRole(user: undefined): undefined
export function toUserWithRole(user: UserWithRoleRelation): UserWithRole
export function toUserWithRole(user: UserWithRoleRelation | undefined): UserWithRole | undefined {
  if (!user) return undefined
  const { userRole, ...userData } = user
  return {
    ...userData,
    role: userRole?.role ?? null,
  }
}

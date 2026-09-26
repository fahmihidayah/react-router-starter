import type { TUser, TUserRole } from '~/db/schema'
import type { UserWithRoles } from '../types'

export function toUserWithRoles(user: any): UserWithRoles {
  return {
    ...user,
    userRoles: undefined,
    roles: user.userRoles.map((e: any) => {
      return {
        ...e.role,
      }
    }),
  }
}

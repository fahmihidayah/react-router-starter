import type { TRole, TUser } from '~/db/schema'

export type UserWithRoles = TUser & {
  roles: TRole[]
}

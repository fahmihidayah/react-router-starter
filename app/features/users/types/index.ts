import type { TRole, TUser } from '~/db/schema'

export type UserWithRole = TUser & {
  role: TRole | null
}

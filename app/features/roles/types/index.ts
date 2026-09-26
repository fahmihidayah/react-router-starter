import type { TPermission, TRole } from '~/db/schema'

export type RoleWithPermissions = TRole & {
  permissions: TPermission[]
}

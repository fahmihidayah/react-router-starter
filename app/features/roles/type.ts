import type { TPermission, TRole } from '~/db/schema'

export type TRoleWithPermissions = TRole & {
  permissions: TPermission[]
}

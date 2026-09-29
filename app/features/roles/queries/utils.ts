import type { TPermission, TRole } from '~/db/schema'
import type { RoleWithPermissions } from '../types'

type RoleWithPermissionRelations = TRole & {
  rolePermissions: Array<{ permission: TPermission }>
}

/**
 * Transform raw database role with junction table data
 * into clean domain model with permissions array
 */
export function toRoleWithPermissions(role: undefined): undefined
export function toRoleWithPermissions(role: RoleWithPermissionRelations): RoleWithPermissions
export function toRoleWithPermissions(
  role: RoleWithPermissionRelations | undefined,
): RoleWithPermissions | undefined {
  if (!role) return undefined

  const { rolePermissions, ...roleData } = role

  return {
    ...roleData,
    permissions: rolePermissions.map(({ permission }) => permission),
  }
}

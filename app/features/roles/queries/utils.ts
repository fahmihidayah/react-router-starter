import type { RoleWithPermissions } from '../types'

/**
 * Transform raw database role with junction table data
 * into clean domain model with permissions array
 */
export function toRoleWithPermissions(role: any): RoleWithPermissions {
  if (!role) return undefined as any

  return {
    ...role,
    rolePermissions: undefined,
    permissions: role.rolePermissions?.map((rp: any) => rp.permission) || [],
  }
}

import * as roleService from '../services'
import { RoleNotFoundError } from '../types/errors'

export async function deleteRoleAction(id: string) {
  try {
    await roleService.deleteById(id)
    return { success: true, message: 'Role deleted successfully' }
  } catch (error) {
    if (error instanceof RoleNotFoundError) return { success: false, message: error.message }
    return { success: false, message: 'An unexpected error occurred. Please try again.' }
  }
}

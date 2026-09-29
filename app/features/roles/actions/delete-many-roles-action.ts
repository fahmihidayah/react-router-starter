import * as roleService from '../services'
import { InvalidRoleDataError } from '../types/errors'

export async function deleteManyRolesAction(ids: string[]) {
  try {
    await roleService.deleteMany(ids)
    return { success: true, message: 'Roles deleted successfully' }
  } catch (error) {
    if (error instanceof InvalidRoleDataError) return { success: false, message: error.message }
    return { success: false, message: 'An unexpected error occurred. Please try again.' }
  }
}

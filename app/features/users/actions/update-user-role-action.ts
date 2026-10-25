import { RoleNotFoundError } from '~/features/roles/types/errors'
import { updateUserRoleSchema } from '../schemas/form/user-schema'
import * as userService from '../services'
import { UserNotFoundError } from '../types/errors'

export async function updateUserRoleAction(userId: string, roleId: string) {
  const result = updateUserRoleSchema.safeParse({ userId, roleId })
  if (!result.success) return { success: false, message: 'A user and role are required' }

  try {
    await userService.updateRole(result.data.userId, result.data.roleId)
    return { success: true, message: 'User role updated successfully' }
  } catch (error) {
    if (error instanceof UserNotFoundError || error instanceof RoleNotFoundError) {
      return { success: false, message: error.message }
    }
    return { success: false, message: 'An unexpected error occurred. Please try again.' }
  }
}

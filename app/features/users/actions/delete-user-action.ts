import type { ActionArgs } from '~/lib/types'
import * as userService from '../services'
import { UserNotFoundError } from '../types/errors/user-errors'

export async function deleteUserAction(args: ActionArgs) {
  const id = args.params.id
  if (!id) {
    throw new Response('User ID is required', { status: 400 })
  }

  try {
    await userService.deleteById(id)
    return { success: true, message: 'User deleted successfully' }
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return { success: false, message: error.message }
    }

    return { success: false, message: 'An unexpected error occurred. Please try again.' }
  }
}

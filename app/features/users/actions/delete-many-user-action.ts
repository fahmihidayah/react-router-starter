import type { ActionArgs } from '~/lib/types'
import * as userService from '../services'
import { InvalidUserDataError } from '../types/errors/user-errors'

export async function deleteManyUsersAction(args: ActionArgs) {
  const formData = await args.request.formData()
  const idsJson = formData.get('ids')

  if (!idsJson || typeof idsJson !== 'string') {
    return { success: false, message: 'Invalid request' }
  }

  try {
    const ids = JSON.parse(idsJson) as string[]

    await userService.deleteMany(ids)
    return { success: true, message: 'Users deleted successfully' }
  } catch (error) {
    if (error instanceof InvalidUserDataError) {
      return { success: false, message: error.message }
    }

    return { success: false, message: 'An unexpected error occurred. Please try again.' }
  }
}

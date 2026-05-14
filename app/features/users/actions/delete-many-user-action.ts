import { inArray } from 'drizzle-orm'
import { user } from '~/db/schema'
import { userRepository } from '../user-repository'

export async function deleteManyUsersAction(ids: string[]) {
  try {
    if (ids.length === 0) {
      return { success: false, message: 'No users selected' }
    }

    await userRepository.deleteMany(inArray(user.id, ids))
    return { success: true, message: 'Users deleted successfully' }
  } catch (error) {
    console.error('Delete many users error:', error)
    return { success: false, message: 'Failed to delete users' }
  }
}

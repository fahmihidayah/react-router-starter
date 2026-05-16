import { userRepository } from '../repositories'

export async function deleteUserAction(id: string) {
  try {
    await userRepository.delete(id)
    return { success: true, message: 'User deleted successfully' }
  } catch (error) {
    console.error('Delete user error:', error)
    return { success: false, message: 'Failed to delete user' }
  }
}

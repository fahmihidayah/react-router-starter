import { postRepository } from '../repositories'

export async function deletePostAction(id: string) {
  try {
    await postRepository.delete(id)
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

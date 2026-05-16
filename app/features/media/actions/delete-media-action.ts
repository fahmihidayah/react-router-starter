import { mediaRepository } from '../repositories'

export async function deleteMediaAction(id: string) {
  try {
    await mediaRepository.delete(id)
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

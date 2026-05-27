import { tagRepository } from '../repositories'

export async function deleteTagAction(id: string) {
  try {
    await tagRepository.delete(id)
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

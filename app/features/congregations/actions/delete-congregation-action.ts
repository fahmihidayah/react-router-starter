import { congregationRepository } from '../repositories'

export async function deleteCongregationAction(id: string) {
  try {
    await congregationRepository.delete(id)
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

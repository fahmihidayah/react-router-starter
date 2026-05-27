import { qurbanRepository } from '../repositories'

export async function deleteQurbanAction(id: string) {
  try {
    await qurbanRepository.delete(id)
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

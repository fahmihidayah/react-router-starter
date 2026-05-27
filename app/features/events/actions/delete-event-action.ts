import { eventRepository } from '../repositories'

export async function deleteEventAction(id: string) {
  try {
    await eventRepository.delete(id)
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

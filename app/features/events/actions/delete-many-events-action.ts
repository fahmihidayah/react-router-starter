import { inArray } from 'drizzle-orm'
import { events } from '~/db/schema'
import { eventRepository } from '../repositories'

export async function deleteManyEventsAction(ids: string[]) {
  if (ids.length === 0) return { success: false }

  try {
    await eventRepository.deleteMany(inArray(event.id, ids))
    return { success: true }
  } catch (error) {
    console.error('Bulk delete error:', error)
    throw error
  }
}

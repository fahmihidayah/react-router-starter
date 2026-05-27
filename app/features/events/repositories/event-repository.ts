import { BaseRepository } from '~/lib/repository'
import { events } from '~/db/schema'

/**
 * Event Repository
 * Extends BaseRepository with event-specific methods
 */
class EventRepository extends BaseRepository<typeof events> {
  // Add custom event-specific methods here if needed
}

export const eventRepository = new EventRepository(events)

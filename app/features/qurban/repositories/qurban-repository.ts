import { BaseRepository } from '~/lib/repository'
import { qurbans } from '~/db/schema'

/**
 * Qurban Repository
 * Extends BaseRepository with qurban-specific methods
 */
class QurbanRepository extends BaseRepository<typeof qurbans> {
  // Add custom qurban-specific methods here if needed
}

export const qurbanRepository = new QurbanRepository(qurbans)

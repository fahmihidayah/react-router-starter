import { BaseRepository } from '~/lib/repository'
import { media } from '~/db/schema'

/**
 * Media Repository
 * Extends BaseRepository with media-specific methods
 */
class MediaRepository extends BaseRepository<typeof media> {
  // Add custom media-specific methods here if needed
}

export const mediaRepository = new MediaRepository(media)

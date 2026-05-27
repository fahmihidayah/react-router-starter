import { BaseRepository } from '~/lib/repository'
import { tags } from '~/db/schema'

/**
 * Tag Repository
 * Extends BaseRepository with tag-specific methods
 */
class TagRepository extends BaseRepository<typeof tags> {
  // Add custom tag-specific methods here if needed
}

export const tagRepository = new TagRepository(tags)

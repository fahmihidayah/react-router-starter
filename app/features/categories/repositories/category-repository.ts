import { BaseRepository } from '~/lib/repository'
import { categories } from '~/db/schema'

/**
 * Category Repository
 * Extends BaseRepository with category-specific methods
 */
class CategoryRepository extends BaseRepository<typeof categories> {
  // Add custom category-specific methods here if needed
}

export const categoryRepository = new CategoryRepository(categories)

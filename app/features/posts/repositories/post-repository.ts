import { eq, like } from 'drizzle-orm'
import { BaseRepository } from '~/lib/repository'
import { posts } from '~/db/schema'
import type { TPostFilter } from '../schemas/post-schema'

/**
 * Post Repository
 * Extends BaseRepository with post-specific methods
 */
class PostRepository extends BaseRepository<typeof posts> {
  /**
   * Find posts with optional filtering
   */
  async findWithFilter(filter: Partial<TPostFilter>) {
    let where = undefined

    if (filter.categoryId) {
      where = eq(posts.categoryId, filter.categoryId)
    }

    if (filter.search) {
      const searchPattern = `%${filter.search}%`
      const searchCondition = like(posts.title, searchPattern)

      where = where ? [where, searchCondition] : searchCondition
    }

    const page = filter.page || 1
    const limit = filter.limit || 10

    return this.findManyPaginated({ where, page, limit })
  }

  /**
   * Find post by slug
   */
  async findBySlug(slug: string) {
    return this.findOne(eq(posts.slug, slug))
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string): Promise<boolean> {
    return this.exists(eq(posts.slug, slug))
  }
}

export const postRepository = new PostRepository(posts)

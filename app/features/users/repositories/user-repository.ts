import { BaseRepository } from '~/lib/repository'
import { user } from '~/db/schema'

/**
 * User Repository
 * Extends BaseRepository with user-specific methods
 */
class UserRepository extends BaseRepository<typeof user> {
  // Add custom user-specific methods here if needed
}

export const userRepository = new UserRepository(user)

import { BaseRepository } from '~/lib/repository'
import { users } from '~/db/schema'

/**
 * User Repository
 * Extends BaseRepository with user-specific methods
 */
class UserRepository extends BaseRepository<typeof users> {
  // Add custom user-specific methods here if needed
}

export const userRepository = new UserRepository(users)

import { BaseRepository } from "~/lib/base/base-repository";
import { user } from "~/db/schema";

/**
 * Task Repository
 * Extends BaseRepository with task-specific methods
 */
class UserRepository extends BaseRepository<typeof user> {
  // Add custom task-specific methods here if needed
  // Example:
  // async findByTitle(title: string) {
  //   return this.findOne(eq(task.title, title));
  // }
}

export const userRepository = new UserRepository(user);
import { BaseRepository } from "~/lib/base/base-repository";
import { task } from "~/db/schema";

/**
 * Task Repository
 * Extends BaseRepository with task-specific methods
 */
class TaskRepository extends BaseRepository<typeof task> {
  // Add custom task-specific methods here if needed
  // Example:
  // async findByTitle(title: string) {
  //   return this.findOne(eq(task.title, title));
  // }
}

export const taskRepository = new TaskRepository(task);
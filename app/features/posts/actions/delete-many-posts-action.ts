import { eq } from 'drizzle-orm'
import { postRepository } from '../repositories'
import { posts } from '~/db/schema'

export async function deleteManyPostsAction(ids: string[]) {
  if (!ids.length) {
    return { success: false, message: 'No posts to delete' }
  }

  try {
    const conditions = ids.map((id) => eq(posts.id, id))
    await postRepository.deleteMany(conditions)
    return { success: true }
  } catch (error) {
    console.error('Delete many error:', error)
    throw error
  }
}

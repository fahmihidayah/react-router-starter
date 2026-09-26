import * as postService from '../services'

export async function deleteManyPostsAction(ids: string[]) {
  if (!ids.length) {
    return { success: false, message: 'No posts to delete' }
  }

  try {
    await postService.deleteMany(ids)
    return { success: true }
  } catch (error) {
    console.error('Delete many error:', error)
    throw error
  }
}

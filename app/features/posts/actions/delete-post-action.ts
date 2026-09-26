import * as postService from '../services'

export async function deletePostAction(id: string) {
  try {
    await postService.deleteById(id)
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

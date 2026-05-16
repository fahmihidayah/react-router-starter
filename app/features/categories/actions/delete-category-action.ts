import { categoryRepository } from '../repositories'

export async function deleteCategoryAction(id: string) {
  try {
    await categoryRepository.delete(id)
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

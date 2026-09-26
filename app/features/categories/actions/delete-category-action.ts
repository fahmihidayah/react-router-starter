import * as categoryService from '../services'
import { CategoryNotFoundError } from '../types/errors/category-errors'

export async function deleteCategoryAction(id: string) {
  try {
    await categoryService.deleteById(id)
    return { success: true }
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      return { success: false, message: error.message }
    }
    throw error
  }
}

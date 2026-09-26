import * as categoryService from '../services'
import { InvalidCategoryDataError } from '../types/errors/category-errors'

export async function deleteManyCategoriesAction(ids: string[]) {
  try {
    await categoryService.deleteMany(ids)
    return { success: true }
  } catch (error) {
    if (error instanceof InvalidCategoryDataError) {
      return { success: false, message: error.message }
    }
    throw error
  }
}

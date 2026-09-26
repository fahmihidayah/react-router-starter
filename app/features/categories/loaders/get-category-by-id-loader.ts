import * as categoryService from '../services'

export async function getCategoryByIdLoader(id: string) {
  return categoryService.findById(id)
}

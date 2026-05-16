import { categoryRepository } from '../repositories'

export async function getCategoryByIdLoader(id: string) {
  return categoryRepository.findById(id)
}

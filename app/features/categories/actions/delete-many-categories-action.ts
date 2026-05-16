import { inArray } from 'drizzle-orm'
import { categories } from '~/db/schema'
import { categoryRepository } from '../repositories'

export async function deleteManyCategoriesAction(ids: string[]) {
  if (ids.length === 0) return { success: false }

  try {
    await categoryRepository.deleteMany(inArray(categories.id, ids))
    return { success: true }
  } catch (error) {
    console.error('Bulk delete error:', error)
    throw error
  }
}

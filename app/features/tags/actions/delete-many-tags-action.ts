import { inArray } from 'drizzle-orm'
import { tags } from '~/db/schema'
import { tagRepository } from '../repositories'

export async function deleteManyTagsAction(ids: string[]) {
  if (ids.length === 0) return { success: false }

  try {
    await tagRepository.deleteMany(inArray(tags.id, ids))
    return { success: true }
  } catch (error) {
    console.error('Bulk delete error:', error)
    throw error
  }
}

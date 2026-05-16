import { inArray } from 'drizzle-orm'
import { media } from '~/db/schema'
import { mediaRepository } from '../repositories'

export async function deleteManyMediaAction(ids: string[]) {
  if (ids.length === 0) return { success: false }

  try {
    await mediaRepository.deleteMany(inArray(media.id, ids))
    return { success: true }
  } catch (error) {
    console.error('Bulk delete error:', error)
    throw error
  }
}

import { inArray } from 'drizzle-orm'
import { congregations } from '~/db/schema'
import { congregationRepository } from '../repositories'

export async function deleteManyCongregationsAction(ids: string[]) {
  if (ids.length === 0) return { success: false }

  try {
    await congregationRepository.deleteMany(inArray(congregations.id, ids))
    return { success: true }
  } catch (error) {
    console.error('Bulk delete error:', error)
    throw error
  }
}

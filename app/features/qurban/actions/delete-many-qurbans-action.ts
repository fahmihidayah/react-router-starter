import { inArray } from 'drizzle-orm'
import { qurbans } from '~/db/schema'
import { qurbanRepository } from '../repositories'

export async function deleteManyQurbansAction(ids: string[]) {
  if (ids.length === 0) return { success: false }

  try {
    await qurbanRepository.deleteMany(inArray(qurban.id, ids))
    return { success: true }
  } catch (error) {
    console.error('Bulk delete error:', error)
    throw error
  }
}

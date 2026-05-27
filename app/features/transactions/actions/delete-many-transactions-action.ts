import { inArray } from 'drizzle-orm'
import { transactions } from '~/db/schema'
import { transactionRepository } from '../repositories'

export async function deleteManyTransactionsAction(ids: string[]) {
  if (ids.length === 0) return { success: false }

  try {
    await transactionRepository.deleteMany(inArray(transactions.id, ids))
    return { success: true }
  } catch (error) {
    console.error('Bulk delete error:', error)
    throw error
  }
}

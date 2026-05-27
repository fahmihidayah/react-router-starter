import { transactionRepository } from '../repositories'

export async function deleteTransactionAction(id: string) {
  try {
    await transactionRepository.delete(id)
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

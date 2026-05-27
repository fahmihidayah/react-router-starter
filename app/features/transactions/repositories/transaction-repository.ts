import { BaseRepository } from '~/lib/repository'
import { transactions } from '~/db/schema'

/**
 * Transaction Repository
 * Extends BaseRepository with transaction-specific methods
 */
class TransactionRepository extends BaseRepository<typeof transactions> {
  // Add custom transaction-specific methods here if needed
}

export const transactionRepository = new TransactionRepository(transactions)

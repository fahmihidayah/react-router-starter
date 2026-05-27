import { BaseRepository } from '~/lib/repository'
import { accounts } from '~/db/schema'

/**
 * Account Repository
 * Extends BaseRepository with account-specific methods
 */
class AccountRepository extends BaseRepository<typeof accounts> {
  // Add custom account-specific methods here if needed
}

export const accountRepository = new AccountRepository(accounts)

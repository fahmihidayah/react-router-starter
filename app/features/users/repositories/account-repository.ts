import { BaseRepository } from '~/lib/repository'
import { account } from '~/db/schema'

/**
 * Account Repository
 * Extends BaseRepository with account-specific methods
 */
class AccountRepository extends BaseRepository<typeof account> {
  // Add custom account-specific methods here if needed
}

export const accountRepository = new AccountRepository(account)

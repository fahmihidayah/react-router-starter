import { and, eq } from 'drizzle-orm'
import { db } from '~/lib/database'
import { accounts } from '../schemas/db/users'

/**
 * Check if a user has an OAuth provider account
 * @param userId - The user ID to check
 * @param providerId - The provider ID to check (e.g., 'google')
 * @returns true if the user has the specified OAuth provider
 */
export async function hasOAuthProvider(userId: string, providerId: string): Promise<boolean> {
  const result = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.providerId, providerId)))
    .limit(1)

  return result.length > 0
}

/**
 * Check if a user has any OAuth provider account
 * @param userId - The user ID to check
 * @returns true if the user has any OAuth provider
 */
export async function hasAnyOAuthProvider(userId: string): Promise<boolean> {
  const result = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .limit(1)

  return result.length > 0
}

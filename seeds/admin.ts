import { randomUUID } from 'node:crypto'
import { hashPassword } from 'better-auth/crypto'
import { and, eq } from 'drizzle-orm'
import { accounts, users } from '../app/db/schema'
import * as roleQueries from '../app/features/roles/queries'
import * as userQueries from '../app/features/users/queries'
import { db } from '../app/lib/database'
import type { BootstrapAdminCredentials } from './lib/credentials'

export type BootstrapAdminResult = {
  created: boolean
  email: string
}

async function setCredentialPassword(userId: string, password: string): Promise<void> {
  const now = new Date()
  const hashedPassword = await hashPassword(password)
  const credentialAccount = await db.query.accounts.findFirst({
    where: { userId, providerId: 'credential' },
  })

  if (credentialAccount) {
    await db
      .update(accounts)
      .set({ password: hashedPassword, updatedAt: now })
      .where(and(eq(accounts.userId, userId), eq(accounts.providerId, 'credential')))
    return
  }

  await db.insert(accounts).values({
    id: randomUUID(),
    accountId: userId,
    providerId: 'credential',
    userId,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  })
}

/**
 * Creates or refreshes a single administrator account with a verified email address, the admin
 * role, and the credential password supplied by the caller.
 *
 * Credentials come from the environment through `resolveBootstrapAdminCredentials`, never from the
 * repository. Re-running the command rotates the password and the role assignment.
 */
export async function seedBootstrapAdmin(
  credentials: BootstrapAdminCredentials,
): Promise<BootstrapAdminResult> {
  const adminRole = await roleQueries.findByKey('admin')

  if (!adminRole) {
    throw new Error('The admin role is missing. Run `bun run db:seed` before bootstrapping an admin.')
  }

  const existingUser = await db.query.users.findFirst({ where: { email: credentials.email } })
  const userId = existingUser?.id ?? randomUUID()
  const now = new Date()

  if (!existingUser) {
    await db.insert(users).values({
      id: userId,
      name: credentials.name,
      email: credentials.email,
      emailVerified: true,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    })
  }

  await Promise.all([
    db
      .update(users)
      .set({ emailVerified: true, role: 'admin', updatedAt: now })
      .where(eq(users.id, userId)),
    setCredentialPassword(userId, credentials.password),
    userQueries.assignRole(userId, adminRole.id),
  ])

  return { created: !existingUser, email: credentials.email }
}

import { redirect } from 'react-router'
import { getEmailVerificationPath } from '~/features/auth/email-verification'
import { userContext } from '~/features/users/contexts/user-context'
import type { Arguments } from '~/lib/types'
import { requireAuth } from './auth.middleware'

/**
 * Role-based authorization middleware
 * Requires the user to have a specific role key.
 * First ensures authentication, then checks the single app role.
 *
 * @param args - Middleware arguments
 * @param roleKeys - One or more accepted immutable role keys
 * @throws 403 Forbidden if user doesn't have required role
 * @throws 401 Unauthorized if user is not authenticated
 */
export async function requireRole(args: Arguments, roleKeys: string | string[]): Promise<void> {
  // First ensure user is authenticated (this sets context)
  await requireAuth(args)

  // Get user from context
  const authSession = args.context.get(userContext)

  if (!authSession?.user) {
    throw new Response('Unauthorized', { status: 401 })
  }

  const requiredRoleKeys = Array.isArray(roleKeys) ? roleKeys : [roleKeys]

  const hasRole = authSession.user.role
    ? requiredRoleKeys.includes(authSession.user.role.key)
    : false

  if (!hasRole) {
    throw new Response('Forbidden - Insufficient permissions', { status: 403 })
  }
}

/**
 * Admin authorization middleware
 * Requires user to have Admin role
 */
export async function requireAdmin(args: Arguments) {
  await requireRole(args, 'admin')
}

/** Requires the standard application User role. */
export async function requireUser(args: Arguments) {
  await requireRole(args, 'user')

  const authSession = args.context.get(userContext)
  if (!authSession?.user) {
    throw redirect('/login')
  }
  if (!authSession.user.emailVerified) {
    throw redirect(getEmailVerificationPath(authSession.user.email))
  }
}

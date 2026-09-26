import { userContext } from '~/features/users/contexts/user-context'
import type { Arguments } from '~/lib/types'
import { requireAuth } from './auth.middleware'

/**
 * Role-based authorization middleware
 * Requires user to have specific role(s)
 * First ensures authentication, then checks roles
 *
 * @param args - Middleware arguments
 * @param roles - Single role or array of roles (user must have at least one)
 * @throws 403 Forbidden if user doesn't have required role
 * @throws 401 Unauthorized if user is not authenticated
 */
export async function requireRole(args: Arguments, roles: string | string[]): Promise<void> {
  // First ensure user is authenticated (this sets context)
  await requireAuth(args)

  // Get user from context
  const authSession = args.context.get(userContext)

  if (!authSession?.user) {
    throw new Response('Unauthorized', { status: 401 })
  }

  const roleNames = authSession.user.roles.map((role: any) => role.name)
  const requiredRoles = Array.isArray(roles) ? roles : [roles]

  const hasRole = requiredRoles.some((role) => roleNames.includes(role))

  if (!hasRole) {
    throw new Response('Forbidden - Insufficient permissions', { status: 403 })
  }
}

/**
 * Admin authorization middleware
 * Requires user to have Admin role
 */
export async function requireAdmin(args: Arguments) {
  await requireRole(args, 'Admin')
}

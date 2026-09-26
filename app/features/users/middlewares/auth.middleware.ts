import { type RouteMatch, redirect } from 'react-router'
import { userContext } from '~/features/users/contexts/user-context'
import { auth } from '~/lib/auth'
import type { Arguments } from '~/lib/types'
import { findById } from '../queries'
import type { UserWithRoles } from '../types'

export type AuthSession = {
  session: {
    id: string
    userId: string
    expiresAt: Date
    token: string
  }
  user: UserWithRoles
}

/**
 * Get the current authenticated session
 * Returns session with user data including roles, or null if not authenticated
 */
export async function getSession(request: Request): Promise<AuthSession | null> {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session?.user?.id) {
    return null
  }

  const user = await findById(session.user.id)

  if (!user) {
    return null
  }

  return {
    session: session.session,
    user,
  }
}

/**
 * Authentication middleware
 * Adds authenticated user to context, throws 401 if not authenticated
 */
export async function requireAuth(args: Arguments) {
  const authSession = await getSession(args.request)

  if (!authSession) {
    throw redirect('/login')
  }

  // Add user to context for downstream loaders/actions to access
  args.context.set(userContext, authSession)
}

/**
 * Optional authentication middleware
 * Adds authenticated user to context if available, doesn't throw if not authenticated
 */
export async function withAuth(args: Arguments) {
  const authSession = await getSession(args.request)
  if (authSession) args.context.set(userContext, authSession)
}

/**
 * Check if user is authenticated (utility function)
 * Returns true if authenticated, false otherwise
 */
export async function isAuthenticated(args: Arguments) {
  const session = await getSession(args.request)

  return session !== null
}

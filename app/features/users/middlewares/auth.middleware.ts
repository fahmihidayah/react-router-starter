import { redirect } from 'react-router'
import { userContext } from '~/features/users/contexts/user-context'
import { auth } from '~/lib/auth'
import type { Arguments } from '~/lib/types'
import { assignRoleByKey, findById } from '../queries'
import type { UserWithRole } from '../types'

export type AuthSession = {
  session: {
    id: string
    userId: string
    expiresAt: Date
    token: string
  }
  user: UserWithRole
}

/**
 * Get the current authenticated session
 * Returns session with user data including roles, or null if not authenticated
 */
export async function getSession(request: Request): Promise<AuthSession | null> {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  // Diagnostic logging for session debugging
  console.log('[Auth Debug] Session check:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    cookies: request.headers.get('cookie'),
    url: request.url,
  })

  if (!session?.user?.id) {
    return null
  }

  let user = await findById(session.user.id)

  if (!user) {
    console.log('[Auth Debug] User not found in database:', session.user.id)
    return null
  }

  // If user has no role assigned, automatically assign the default 'user' role
  if (!user.role) {
    console.log('[Auth Debug] User has no role, assigning default "user" role:', session.user.id)
    await assignRoleByKey(session.user.id, 'user')
    // Re-fetch user to get the updated role
    user = await findById(session.user.id)
    if (!user) {
      console.log('[Auth Debug] Failed to fetch user after role assignment:', session.user.id)
      return null
    }
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

import { userContext } from '~/features/users/contexts/user-context'
import { type Arguments, createErrorResponse, toJsonResponse } from '~/lib/types'
import { getSession } from './auth.middleware'

/**
 * Protects API routes without redirecting unauthenticated clients to a page.
 * Adds the authenticated session to context for downstream loaders and actions.
 */
export async function requireApiAuth(args: Arguments): Promise<void> {
  const authSession = await getSession(args.request)

  if (!authSession) {
    throw toJsonResponse(createErrorResponse('Unauthorized', 401))
  }

  args.context.set(userContext, authSession)
}

/**
 * Restricts an API route to the given immutable role keys.
 * Returns JSON responses so API clients receive 401/403 instead of a redirect.
 */
export async function requireApiRole(
  args: Arguments,
  roleKeys: string | readonly string[],
): Promise<void> {
  await requireApiAuth(args)

  const acceptedRoleKeys = typeof roleKeys === 'string' ? [roleKeys] : roleKeys
  const assignedRoleKey = args.context.get(userContext)?.user?.role?.key

  if (!assignedRoleKey || !acceptedRoleKeys.includes(assignedRoleKey)) {
    throw toJsonResponse(createErrorResponse('Forbidden - Insufficient permissions', 403))
  }
}

/**
 * Restricts an API route to administrators.
 * Use this for endpoints that are not part of the standard permission registry. Prefer
 * `enforceRoutePermissions` for operation-level authorization.
 */
export function requireApiAdmin(args: Arguments): Promise<void> {
  return requireApiRole(args, 'admin')
}

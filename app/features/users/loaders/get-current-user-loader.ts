import { userContext } from '~/features/users/contexts'
import {
  type ApiResponse,
  createErrorResponse,
  createSuccessResponse,
  type LoaderArgs,
} from '~/lib/types'
import type { UserWithRoles } from '../types'

/**
 * Get current user loader
 * Assumes withAuth middleware has been applied to set user context
 */
export async function getCurrentUserLoader(
  args: LoaderArgs,
): Promise<ApiResponse<{ user: UserWithRoles }>> {
  // Get user from context (set by withAuth or requireAuth middleware)
  const authSession = args.context.get(userContext)

  if (!authSession?.user) {
    return createErrorResponse('Not Found', 400)
  }

  return createSuccessResponse({
    user: authSession.user,
  })
}

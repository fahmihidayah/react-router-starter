import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import { requireApiAuth } from '~/features/users/middlewares'
import * as userRepository from '~/features/users/queries'
import { createErrorResponse, toJsonResponse } from '~/lib/types'
import type { Route } from './+types/users.$id'

export const middleware: Route.MiddlewareFunction[] = [
  requireApiAuth,
  enforceRoutePermissions({ loader: PERMISSION_KEYS.USERS_READ }),
]

export async function loader({ params }: Route.LoaderArgs) {
  const user = await userRepository.findById(params.id)

  if (!user) {
    return toJsonResponse(createErrorResponse('User not found', 404))
  }

  return Response.json(user)
}

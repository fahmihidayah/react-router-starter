import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import { getUsersLoader } from '~/features/users/loaders/get-users-loader'
import { requireApiAuth } from '~/features/users/middlewares'
import type { Route } from './+types/users'

export const middleware: Route.MiddlewareFunction[] = [
  requireApiAuth,
  enforceRoutePermissions({ loader: PERMISSION_KEYS.USERS_READ }),
]

export async function loader(params: Route.LoaderArgs) {
  const result = await getUsersLoader(params)
  return Response.json(result)
}

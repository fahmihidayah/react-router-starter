import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import { getCurrentUserLoader } from '~/features/users/loaders/get-current-user-loader'
import { requireApiAuth } from '~/features/users/middlewares'
import { toJsonResponse } from '~/lib/types'
import type { Route } from './+types/users.me'

export const middleware: Route.MiddlewareFunction[] = [
  requireApiAuth,
  enforceRoutePermissions({ loader: PERMISSION_KEYS.ACCOUNT_READ }),
]

export async function loader(args: Route.LoaderArgs) {
  return toJsonResponse(await getCurrentUserLoader(args))
}

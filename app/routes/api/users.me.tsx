import { getCurrentUserLoader } from '~/features/users/loaders/get-current-user-loader'
import type { Route } from './+types/users.me'

export async function loader(args: Route.LoaderArgs) {
  const currentUser = await getCurrentUserLoader(args)

  return Response.json(currentUser)
}

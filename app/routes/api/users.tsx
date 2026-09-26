import { getUsersLoader } from '~/features/users/loaders/get-users-loader'
import type { Route } from './+types/users'

export async function loader(params: Route.LoaderArgs) {
  const result = await getUsersLoader(params)
  return Response.json(result)
}

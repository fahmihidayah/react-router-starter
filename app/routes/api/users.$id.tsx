import * as userRepository from '~/features/users/queries'
import type { Route } from './+types/users.$id'

export async function loader(loaderArgs: Route.LoaderArgs) {
  const id = loaderArgs.params.id
  const result = await userRepository.findById(id)
  return result
}

import { redirect } from 'react-router'
import { getSession } from '~/features/users/middlewares'
import { getPostLoginPath } from '../utils/get-post-login-path'

export async function redirectAuthenticatedUser(request: Request) {
  const session = await getSession(request)

  if (session?.user) {
    throw redirect(getPostLoginPath(session.user.role))
  }

  return null
}

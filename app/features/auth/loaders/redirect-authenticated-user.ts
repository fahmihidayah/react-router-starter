import { redirect } from 'react-router'
import { auth } from '~/lib/auth'

export async function redirectAuthenticatedUser(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    if (session?.user) {
      throw redirect('/admin')
    }

    return null
  } catch {
    return null
  }
}

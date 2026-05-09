import { redirect, useNavigate } from 'react-router'
import { DashboardLayout } from '~/components/common/dashboard'
import { auth } from '~/lib/auth'
import { authClient } from '~/lib/auth-client'
import type { Route } from './+types/dashboard'

export async function loader({ params, request }: Route.LoaderArgs) {
  const _session = await auth.api.getSession({
    headers: request.headers,
  })
  if (!_session) {
    throw redirect('/login')
  }
  return {
    user: _session.user,
  }
}

export default function DashboardRoute({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate('/login')
  }

  return <DashboardLayout user={user} onSignOut={handleSignOut} />
}

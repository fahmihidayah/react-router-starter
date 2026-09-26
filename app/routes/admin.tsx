import { Outlet, RouterContextProvider, redirect, useNavigate } from 'react-router'
import { Config, createAdminMenu } from '~/features/admin'
import { AdminLayout } from '~/features/admin/components/admin-layout'
import { userContext } from '~/features/users/contexts'
import { requireAuth } from '~/features/users/middlewares'
import { authClient } from '~/lib/auth-client'
import type { Route } from './+types/admin'

// Apply admin middleware to protect all admin routes
export const middleware: Route.MiddlewareFunction[] = [requireAuth]

export async function loader({ context }: Route.LoaderArgs) {
  // Get user from context (set by requireAdmin middleware)
  const authSession = context.get(userContext)
  console.log('data session user : ', authSession.user)
  if (authSession.user === null) {
    redirect('/login')
  }

  return {
    user: authSession.user,
  }
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate('/login')
  }

  return (
    <AdminLayout
      user={{
        email: user?.email ?? '',
        id: user?.id ?? '',
        name: user?.name ?? '',
        payload: user,
        roles: user?.roles.map((e) => e.name),
      }}
      config={Config}
      onSignOut={handleSignOut}
    >
      <Outlet />
    </AdminLayout>
  )
}

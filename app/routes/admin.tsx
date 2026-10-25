import { isRouteErrorResponse, Outlet, useNavigate } from 'react-router'
import { ErrorStatusPage, getErrorStatus } from '~/components/error-status-page'
import { Config } from '~/features/admin'
import { AdminLayout } from '~/features/admin/components/admin-layout'
import { userContext } from '~/features/users/contexts'
import { requireAdmin } from '~/features/users/middlewares'
import { authClient } from '~/lib/auth-client'
import type { Route } from './+types/admin'

// Apply admin middleware to protect all admin routes
export const middleware: Route.MiddlewareFunction[] = [requireAdmin]

export async function loader({ context }: Route.LoaderArgs) {
  // Get user from context (set by requireAdmin middleware)
  const authSession = context.get(userContext)
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
        roles: user?.role ? [user.role.key] : [],
      }}
      config={Config}
      onSignOut={handleSignOut}
    >
      <Outlet />
    </AdminLayout>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    const status = getErrorStatus(error.status)
    if (status) return <ErrorStatusPage status={status} />
  }

  const technicalDetails =
    import.meta.env.DEV && error instanceof Error ? error.stack || error.message : undefined

  return <ErrorStatusPage status={500} technicalDetails={technicalDetails} />
}

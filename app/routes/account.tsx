import { isRouteErrorResponse, Outlet } from 'react-router'
import { ErrorStatusPage, getErrorStatus } from '~/components/error-status-page'
import { requireUser } from '~/features/users/middlewares'
import type { Route } from './+types/account'

// Protect the authenticated user account area for all signed-in users.
export const middleware: Route.MiddlewareFunction[] = [requireUser]

export default function AccountLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Outlet />
    </div>
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

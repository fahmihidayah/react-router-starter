import { isRouteErrorResponse, Outlet, redirect } from 'react-router'
import { ErrorStatusPage, getErrorStatus } from '~/components/error-status-page'
import { Config } from '~/features/track-app'
import { TrackAppLayout } from '~/features/track-app/components/track-app-layout'
import { userContext } from '~/features/users/contexts'
import { requireUser } from '~/features/users/middlewares'
import type { Route } from './+types/track-app'

export const middleware: Route.MiddlewareFunction[] = [requireUser]

export async function loader({ context }: Route.LoaderArgs) {
  const authSession = context.get(userContext)

  if (!authSession.user) {
    throw redirect('/login')
  }

  return { user: authSession.user }
}

export default function TrackAppRoute({ loaderData }: Route.ComponentProps) {
  return (
    <TrackAppLayout
      config={Config}
      user={{
        email: loaderData.user.email,
        id: loaderData.user.id,
        name: loaderData.user.name,
        payload: loaderData.user,
        roles: loaderData.user.role ? [loaderData.user.role.key] : [],
      }}
    >
      <Outlet />
    </TrackAppLayout>
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

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router'

import type { Route } from './+types/root'
import './app.css'

import type { MiddlewareFunction } from 'react-router'
import {
  GoogleTagManagerHead,
  GoogleTagManagerNoScript,
  GoogleTagManagerPageViews,
} from '~/components/analytics/google-tag-manager'
import { ErrorStatusPage, getErrorStatus } from '~/components/error-status-page'
import { Toaster } from '~/components/ui/sonner'
import { env } from '~/env'
import { observabilityMiddleware } from '~/features/observability'
import { ConsentBanner } from '~/features/privacy/components'
import {
  applySecurityHeaders,
  securityHeadersMiddleware,
} from '~/features/security/security-headers'
import { getLocale } from '~/paraglide/runtime.js'
import { paraglideMiddleware } from './paraglide/server.js'

export const middleware: MiddlewareFunction[] = [
  observabilityMiddleware,
  securityHeadersMiddleware,
  (ctx, next) => paraglideMiddleware(ctx.request, () => next()),
]

export function loader() {
  return {
    gtmContainerId: env.GTM_CONTAINER_ID,
    consentBannerEnabled: env.CONSENT_BANNER_ENABLED,
  }
}

export function headers({ actionHeaders, errorHeaders, loaderHeaders }: Route.HeadersArgs) {
  const source = errorHeaders ?? ([...actionHeaders].length ? actionHeaders : loaderHeaders)
  return applySecurityHeaders(new Headers(source))
}

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>('root')
  const gtmContainerId = data?.gtmContainerId
  const consentBannerEnabled = data?.consentBannerEnabled ?? true

  return (
    <html lang={getLocale()}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <GoogleTagManagerHead containerId={gtmContainerId} />
        <Meta />
        <Links />
      </head>
      <body>
        <GoogleTagManagerNoScript containerId={gtmContainerId} />
        {children}
        <Toaster richColors position="top-right" />
        {consentBannerEnabled && <ConsentBanner />}
        <GoogleTagManagerPageViews containerId={gtmContainerId} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
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

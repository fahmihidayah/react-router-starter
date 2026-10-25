import { auth } from '~/lib/auth'
import type { Route } from './+types/auth.$'

// Universal auth handler for all HTTP methods
async function handleAuth(request: Request) {
  const response = await auth.handler(request)

  // Ensure CORS headers are set
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Captcha-Response')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export async function loader({ request }: Route.LoaderArgs) {
  return handleAuth(request)
}

export async function action({ request }: Route.ActionArgs) {
  return handleAuth(request)
}

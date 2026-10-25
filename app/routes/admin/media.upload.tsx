import { uploadMediaAction } from '~/features/media/actions/upload-media-action'
import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import { checkRateLimit, rateLimitHeaders } from '~/features/security/rate-limit.server'
import type { Route } from './+types/media.upload'

export const middleware: Route.MiddlewareFunction[] = [
  enforceRoutePermissions({ action: PERMISSION_KEYS.MEDIA_CREATE }),
]

export async function action({ request }: Route.ActionArgs) {
  const limit = await checkRateLimit(request, {
    max: 30,
    scope: 'media-upload',
    windowSeconds: 60,
  })
  if (!limit.allowed) {
    return Response.json(
      { errors: { file: ['Too many uploads. Wait a moment and try again.'] } },
      { status: 429, headers: rateLimitHeaders(limit.retryAfterSeconds) },
    )
  }
  return uploadMediaAction(request)
}

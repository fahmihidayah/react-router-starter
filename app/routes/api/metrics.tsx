import { getObservabilityConfig, metricsContentType, renderMetrics } from '~/features/observability'
import type { Route } from './+types/metrics'

export async function loader({ request }: Route.LoaderArgs) {
  const config = getObservabilityConfig()

  if (!config.metrics.enabled) {
    throw new Response('Not Found', { status: 404 })
  }

  if (config.metrics.token) {
    const authorization = request.headers.get('authorization')
    if (authorization !== `Bearer ${config.metrics.token}`) {
      throw new Response('Unauthorized', { status: 401 })
    }
  }

  const metrics = await renderMetrics()
  return new Response(metrics, {
    headers: {
      'Content-Type': metricsContentType(),
    },
  })
}

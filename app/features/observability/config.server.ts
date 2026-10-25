import { env } from '~/env'

export type ObservabilityConfig = {
  environment: string
  metrics: {
    enabled: boolean
    token?: string
  }
  release?: string
  sentryDsn?: string
}

let cachedConfig: ObservabilityConfig | undefined

export function getObservabilityConfig(): ObservabilityConfig {
  if (cachedConfig) return cachedConfig

  cachedConfig = {
    environment: env.OBSERVABILITY_ENVIRONMENT ?? env.NODE_ENV,
    metrics: {
      enabled: env.OBSERVABILITY_METRICS_ENABLED,
      token: env.OBSERVABILITY_METRICS_TOKEN,
    },
    release: env.OBSERVABILITY_RELEASE,
    sentryDsn: env.OBSERVABILITY_SENTRY_DSN,
  }

  return cachedConfig
}

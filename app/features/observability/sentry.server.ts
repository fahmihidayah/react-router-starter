import * as Sentry from '@sentry/node'
import { getObservabilityConfig } from './config.server'

let initialized = false

export function initSentry(): void {
  if (initialized) return

  const config = getObservabilityConfig()
  if (!config.sentryDsn) {
    initialized = true
    return
  }

  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.environment,
    release: config.release,
    tracesSampleRate: 0,
  })

  initialized = true
}

export { Sentry }

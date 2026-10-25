import { logger } from '~/utils/logger'
import { getObservabilityContext } from './context.server'

function withContext(data?: unknown): unknown {
  const context = getObservabilityContext()
  if (!context) return data

  const trace = {
    requestId: context.requestId,
    traceId: context.traceId,
    spanId: context.spanId,
  }
  if (data === undefined) return trace
  if (data instanceof Error) {
    return {
      ...trace,
      error: {
        name: data.name,
        message: data.message,
        stack: data.stack,
      },
    }
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) return { ...trace, ...data }
  return { ...trace, data }
}

export function createServerLogger(component: string) {
  const scoped = logger.scope(component)
  return {
    debug: (message: string, data?: unknown) => scoped.debug(message, withContext(data)),
    error: (message: string, error?: unknown) => scoped.error(message, withContext(error)),
    info: (message: string, data?: unknown) => scoped.info(message, withContext(data)),
    warn: (message: string, data?: unknown) => scoped.warn(message, withContext(data)),
  }
}

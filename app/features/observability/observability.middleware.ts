import type { MiddlewareFunction } from 'react-router'
import {
  createRequestContext,
  formatTraceparent,
  getObservabilityContext,
  runWithObservabilityContext,
} from './context.server'
import { createServerLogger } from './logger.server'
import { incrementErrorReports, incrementHttpRequests, observeHttpDuration } from './metrics.server'
import { Sentry } from './sentry.server'

const requestLogger = createServerLogger('HTTP')

// Normalize route pathname for metrics labels to prevent cardinality explosion
function normalizeRoute(pathname: string): string {
  // Simple normalization for common patterns
  // This prevents high cardinality by replacing dynamic segments with placeholders
  return (
    pathname
      .split('/')
      .map((segment) => {
        // UUID pattern
        if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(segment)) return ':id'
        // Integer pattern
        if (/^\d+$/.test(segment)) return ':id'
        // Slug pattern (alphanumeric with dashes, longer than 5 chars)
        if (/^[a-z0-9-]+$/i.test(segment) && segment.includes('-') && segment.length > 5)
          return ':slug'
        return segment
      })
      .join('/')
      .toLowerCase() || 'unmatched'
  )
}

export const observabilityMiddleware: MiddlewareFunction = async ({ request }, next) => {
  const context = createRequestContext(request)
  return runWithObservabilityContext(context, async () => {
    const startedAt = performance.now()
    const method = request.method.toUpperCase()
    const pathname = new URL(request.url).pathname
    const route = normalizeRoute(pathname)
    let status = 500

    try {
      const result = await next()
      status = result instanceof Response ? result.status : 200
      if (result instanceof Response) {
        result.headers.set('X-Request-ID', context.requestId)
        const traceparent = formatTraceparent(context)
        if (traceparent) result.headers.set('traceparent', traceparent)
      }
      return result
    } catch (error) {
      status = error instanceof Response ? error.status : 500
      if (!(error instanceof Response)) {
        const errorObj = error instanceof Error ? error : new Error(String(error))
        requestLogger.error('Request failed', errorObj)

        // Report to Sentry if not an aborted request
        if (!request.signal.aborted) {
          const ctx = getObservabilityContext()
          Sentry.captureException(errorObj, {
            tags: {
              requestId: ctx?.requestId ?? 'unknown',
              traceId: ctx?.traceId ?? 'unknown',
            },
          })
          incrementErrorReports('success')
        }
      }
      throw error
    } finally {
      const durationMs = performance.now() - startedAt
      incrementHttpRequests(method, route, String(status))
      observeHttpDuration(method, route, durationMs)
      requestLogger.info('Request completed', { method, route, status, durationMs })
    }
  })
}

import { env } from '~/env'
import { getRateLimitRedisClient } from './redis-rate-limit.server'

export type RedisHealthResult = {
  healthy: boolean
  error?: string
}

/**
 * Check Redis connectivity.
 * Returns a safe result object without exposing sensitive connection details.
 * Only runs if RATE_LIMIT_ENABLED is true.
 * This is a non-critical check - Redis being down should not prevent the app from running.
 */
export async function checkRedisHealth(): Promise<RedisHealthResult> {
  // Skip check if Redis rate limiting is not enabled
  if (!env.RATE_LIMIT_ENABLED) {
    return { healthy: true } // Not applicable, consider it healthy
  }

  try {
    const client = await getRateLimitRedisClient()

    // Use ping to verify the connection
    const pong = await client.ping()

    if (pong === 'PONG') {
      return { healthy: true }
    }

    return {
      healthy: false,
      error: 'ping_failed',
    }
  } catch (_error) {
    // Return generic error without leaking connection details
    return {
      healthy: false,
      error: 'connection_failed',
    }
  }
}

import { sql } from 'drizzle-orm'
import { db } from './database'

export type DatabaseHealthResult = {
  healthy: boolean
  latencyMs?: number
  error?: string
}

/**
 * Check database connectivity and measure query latency.
 * Returns a safe result object without exposing sensitive connection details.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  const startTime = performance.now()

  try {
    // Execute a simple query to verify the connection
    await db.execute(sql`SELECT 1`)

    const latencyMs = Math.round(performance.now() - startTime)

    return {
      healthy: true,
      latencyMs,
    }
  } catch (_error) {
    // Return generic error without leaking connection details
    return {
      healthy: false,
      error: 'connection_failed',
    }
  }
}

import { checkS3Health } from '~/features/media/storage/s3-health'
import { checkRabbitMqHealth } from '~/features/queue/health.server'
import { checkRedisHealth } from '~/features/security/redis-health.server'
import { checkDatabaseHealth } from '~/lib/database-health'

type ComponentStatus = 'healthy' | 'degraded' | 'unhealthy'

type HealthCheck = {
  status: ComponentStatus
  latencyMs?: number
  error?: string
}

type ReadinessResponse = {
  status: ComponentStatus
  timestamp: string
  checks: {
    database: HealthCheck
    rabbitmq?: HealthCheck
    s3?: HealthCheck
    redis?: HealthCheck
  }
}

/**
 * Readiness endpoint: indicates the application can handle requests.
 * Checks critical dependencies (database) and optional dependencies (RabbitMQ, S3, Redis).
 * Returns 200 if ready, 503 if not ready.
 */
export async function loader() {
  const timestamp = new Date().toISOString()

  // Run all health checks in parallel for better performance
  const [rabbitmqResult, databaseResult, s3Result, redisResult] = await Promise.all([
    checkRabbitMqHealth(),
    checkDatabaseHealth(),
    checkS3Health(),
    checkRedisHealth(),
  ])

  // Determine overall status
  let overallStatus: ComponentStatus = 'healthy'

  // Database is critical - if it fails, we're unhealthy
  if (!databaseResult.healthy) {
    overallStatus = 'unhealthy'
  }

  // RabbitMQ and S3 are critical if enabled
  if (!rabbitmqResult.healthy || !s3Result.healthy) {
    overallStatus = 'unhealthy'
  }

  // Redis is non-critical - degraded if it fails but still operational
  if (!redisResult.healthy && overallStatus === 'healthy') {
    overallStatus = 'degraded'
  }

  const response: ReadinessResponse = {
    status: overallStatus,
    timestamp,
    checks: {
      database: {
        status: databaseResult.healthy ? 'healthy' : 'unhealthy',
        latencyMs: databaseResult.latencyMs,
        error: databaseResult.error,
      },
    },
  }

  // Only include RabbitMQ if it's being used
  if (rabbitmqResult.healthy !== undefined) {
    response.checks.rabbitmq = {
      status: rabbitmqResult.healthy ? 'healthy' : 'unhealthy',
      error: rabbitmqResult.error,
    }
  }

  // Only include S3 if it's being used
  if (s3Result.healthy !== undefined) {
    response.checks.s3 = {
      status: s3Result.healthy ? 'healthy' : 'unhealthy',
      error: s3Result.error,
    }
  }

  // Only include Redis if it's enabled
  if (redisResult.healthy !== undefined) {
    response.checks.redis = {
      status: redisResult.healthy ? 'healthy' : 'degraded',
      error: redisResult.error,
    }
  }

  // Return 503 if not ready, 200 if ready or degraded
  const httpStatus = overallStatus === 'unhealthy' ? 503 : 200

  return Response.json(response, {
    status: httpStatus,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

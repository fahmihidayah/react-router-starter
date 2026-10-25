import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock all health check modules before imports
vi.mock('~/lib/database-health', () => ({
  checkDatabaseHealth: vi.fn(),
}))

vi.mock('~/features/media/storage/s3-health', () => ({
  checkS3Health: vi.fn(),
}))

vi.mock('~/features/queue/health.server', () => ({
  checkRabbitMqHealth: vi.fn(),
}))

vi.mock('~/features/security/redis-health.server', () => ({
  checkRedisHealth: vi.fn(),
}))

import * as s3Health from '~/features/media/storage/s3-health'
import * as queueHealth from '~/features/queue/health.server'
import * as redisHealth from '~/features/security/redis-health.server'
import * as databaseHealth from '~/lib/database-health'
import { loader } from './ready'

describe('/api/ready (readiness)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns 200 when all dependencies are healthy', async () => {
    vi.mocked(databaseHealth.checkDatabaseHealth).mockResolvedValue({
      healthy: true,
      latencyMs: 12,
    })
    vi.mocked(queueHealth.checkRabbitMqHealth).mockResolvedValue({ healthy: true })
    vi.mocked(s3Health.checkS3Health).mockResolvedValue({ healthy: true })
    vi.mocked(redisHealth.checkRedisHealth).mockResolvedValue({ healthy: true })

    const response = await loader()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.checks.database.status).toBe('healthy')
    expect(data.checks.database.latencyMs).toBe(12)
  })

  it('returns 503 when database is unhealthy', async () => {
    vi.mocked(databaseHealth.checkDatabaseHealth).mockResolvedValue({
      healthy: false,
      error: 'connection_failed',
    })
    vi.mocked(queueHealth.checkRabbitMqHealth).mockResolvedValue({ healthy: true })
    vi.mocked(s3Health.checkS3Health).mockResolvedValue({ healthy: true })
    vi.mocked(redisHealth.checkRedisHealth).mockResolvedValue({ healthy: true })

    const response = await loader()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.checks.database.status).toBe('unhealthy')
    expect(data.checks.database.error).toBe('connection_failed')
  })

  it('returns 503 when RabbitMQ is unhealthy', async () => {
    vi.mocked(databaseHealth.checkDatabaseHealth).mockResolvedValue({
      healthy: true,
      latencyMs: 10,
    })
    vi.mocked(queueHealth.checkRabbitMqHealth).mockResolvedValue({
      healthy: false,
      error: 'connection_failed',
    })
    vi.mocked(s3Health.checkS3Health).mockResolvedValue({ healthy: true })
    vi.mocked(redisHealth.checkRedisHealth).mockResolvedValue({ healthy: true })

    const response = await loader()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
  })

  it('returns 503 when S3 is unhealthy', async () => {
    vi.mocked(databaseHealth.checkDatabaseHealth).mockResolvedValue({
      healthy: true,
      latencyMs: 10,
    })
    vi.mocked(queueHealth.checkRabbitMqHealth).mockResolvedValue({ healthy: true })
    vi.mocked(s3Health.checkS3Health).mockResolvedValue({
      healthy: false,
      error: 'connection_failed',
    })
    vi.mocked(redisHealth.checkRedisHealth).mockResolvedValue({ healthy: true })

    const response = await loader()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
  })

  it('returns 200 with degraded status when Redis is unhealthy', async () => {
    vi.mocked(databaseHealth.checkDatabaseHealth).mockResolvedValue({
      healthy: true,
      latencyMs: 10,
    })
    vi.mocked(queueHealth.checkRabbitMqHealth).mockResolvedValue({ healthy: true })
    vi.mocked(s3Health.checkS3Health).mockResolvedValue({ healthy: true })
    vi.mocked(redisHealth.checkRedisHealth).mockResolvedValue({
      healthy: false,
      error: 'connection_failed',
    })

    const response = await loader()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('degraded')
    expect(data.checks.redis?.status).toBe('degraded')
  })

  it('includes timestamp in response', async () => {
    vi.mocked(databaseHealth.checkDatabaseHealth).mockResolvedValue({
      healthy: true,
      latencyMs: 10,
    })
    vi.mocked(queueHealth.checkRabbitMqHealth).mockResolvedValue({ healthy: true })
    vi.mocked(s3Health.checkS3Health).mockResolvedValue({ healthy: true })
    vi.mocked(redisHealth.checkRedisHealth).mockResolvedValue({ healthy: true })

    const response = await loader()
    const data = await response.json()

    expect(data.timestamp).toBeDefined()
    const timestamp = new Date(data.timestamp)
    expect(timestamp.toISOString()).toBe(data.timestamp)
  })

  it('does not leak sensitive information in errors', async () => {
    vi.mocked(databaseHealth.checkDatabaseHealth).mockResolvedValue({
      healthy: false,
      error: 'connection_failed',
    })
    vi.mocked(queueHealth.checkRabbitMqHealth).mockResolvedValue({ healthy: true })
    vi.mocked(s3Health.checkS3Health).mockResolvedValue({ healthy: true })
    vi.mocked(redisHealth.checkRedisHealth).mockResolvedValue({ healthy: true })

    const response = await loader()
    const data = await response.json()

    // Should have generic error, not connection strings or credentials
    expect(data.checks.database.error).toBe('connection_failed')
    expect(JSON.stringify(data)).not.toContain('postgres://')
    expect(JSON.stringify(data)).not.toContain('password')
  })

  it('runs all health checks in parallel', async () => {
    const dbPromise = Promise.resolve({ healthy: true, latencyMs: 10 })
    const rabbitPromise = Promise.resolve({ healthy: true })
    const s3Promise = Promise.resolve({ healthy: true })
    const redisPromise = Promise.resolve({ healthy: true })

    vi.mocked(databaseHealth.checkDatabaseHealth).mockReturnValue(dbPromise)
    vi.mocked(queueHealth.checkRabbitMqHealth).mockReturnValue(rabbitPromise)
    vi.mocked(s3Health.checkS3Health).mockReturnValue(s3Promise)
    vi.mocked(redisHealth.checkRedisHealth).mockReturnValue(redisPromise)

    await loader()

    // All should be called
    expect(databaseHealth.checkDatabaseHealth).toHaveBeenCalled()
    expect(queueHealth.checkRabbitMqHealth).toHaveBeenCalled()
    expect(s3Health.checkS3Health).toHaveBeenCalled()
    expect(redisHealth.checkRedisHealth).toHaveBeenCalled()
  })
})

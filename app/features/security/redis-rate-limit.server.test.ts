import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { consumeRedisRateLimit, createBetterAuthRateLimitStorage } from './redis-rate-limit.server'

const redisMocks = vi.hoisted(() => {
  const client = {
    connect: vi.fn(),
    eval: vi.fn(),
    get: vi.fn(),
    on: vi.fn(),
    set: vi.fn(),
  }
  client.connect.mockResolvedValue(client)
  return { client, createClient: vi.fn(() => client) }
})

vi.mock('redis', () => ({ createClient: redisMocks.createClient }))

const originalEnv = { ...process.env }

describe('Redis rate-limit storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BETTER_AUTH_SECRET = 'test-secret-with-enough-entropy'
    process.env.RATE_LIMIT_REDIS_PREFIX = 'test:rate-limit'
    process.env.RATE_LIMIT_REDIS_URL = 'redis://localhost:6379'
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('atomically consumes a fixed window and never exposes the raw identifier in its key', async () => {
    redisMocks.client.eval.mockResolvedValue([2, 42_000])

    await expect(consumeRedisRateLimit('register:person@example.com', 3, 60)).resolves.toEqual({
      allowed: true,
      retryAfterSeconds: 42,
    })

    const [, options] = redisMocks.client.eval.mock.calls[0]
    expect(options.keys[0]).toMatch(/^test:rate-limit:app:[a-f0-9]{64}$/)
    expect(options.keys[0]).not.toContain('person@example.com')
    expect(options.arguments).toEqual(['60000'])
  })

  it('provides the same atomic Redis limiter to Better Auth', async () => {
    redisMocks.client.eval.mockResolvedValue([4, 3_200])
    const storage = createBetterAuthRateLimitStorage()

    await expect(
      storage.consume('203.0.113.10|/sign-in/email', { max: 3, window: 60 }),
    ).resolves.toEqual({ allowed: false, retryAfter: 4 })

    const [, options] = redisMocks.client.eval.mock.calls[0]
    expect(options.keys[0]).toMatch(/^test:rate-limit:better-auth:[a-f0-9]{64}$/)
    expect(options.keys[0]).not.toContain('203.0.113.10')
  })
})

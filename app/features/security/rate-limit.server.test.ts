import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkRateLimit, rateLimitHeaders } from './rate-limit.server'
import { consumeRedisRateLimit } from './redis-rate-limit.server'

vi.mock('./redis-rate-limit.server', () => ({ consumeRedisRateLimit: vi.fn() }))

const originalEnv = { ...process.env }

describe('application rate limiting', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.RATE_LIMIT_ENABLED = 'true'
    process.env.BETTER_AUTH_SECRET = 'test-secret-with-enough-entropy'
    process.env.AUTH_IP_HEADERS = 'x-forwarded-for'
    vi.mocked(consumeRedisRateLimit).mockResolvedValue({
      allowed: true,
      retryAfterSeconds: 0,
    })
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('uses separate normalized buckets for the client and supplied subjects', async () => {
    const request = new Request('https://app.example.com/register', {
      headers: { 'x-forwarded-for': '203.0.113.10' },
    })

    await expect(
      checkRateLimit(request, {
        max: 3,
        scope: 'register',
        subjects: ['Person@Example.com'],
        windowSeconds: 60,
      }),
    ).resolves.toEqual({ allowed: true, retryAfterSeconds: 0 })

    expect(consumeRedisRateLimit).toHaveBeenCalledTimes(2)
    expect(consumeRedisRateLimit).toHaveBeenNthCalledWith(1, 'register:203.0.113.10', 3, 60)
    expect(consumeRedisRateLimit).toHaveBeenNthCalledWith(2, 'register:person@example.com', 3, 60)
  })

  it('returns the longest retry period when a bucket is exhausted', async () => {
    vi.mocked(consumeRedisRateLimit)
      .mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 12 })
      .mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 25 })

    const decision = await checkRateLimit(new Request('https://app.example.com'), {
      max: 3,
      scope: 'email',
      subjects: ['person@example.com'],
      windowSeconds: 60,
    })

    expect(decision).toEqual({ allowed: false, retryAfterSeconds: 25 })
    expect(new Headers(rateLimitHeaders(25)).get('Retry-After')).toBe('25')
  })

  it('does not access Redis when rate limiting is disabled', async () => {
    process.env.RATE_LIMIT_ENABLED = 'false'

    await expect(
      checkRateLimit(new Request('https://app.example.com'), {
        max: 3,
        scope: 'email',
        windowSeconds: 60,
      }),
    ).resolves.toEqual({ allowed: true, retryAfterSeconds: 0 })
    expect(consumeRedisRateLimit).not.toHaveBeenCalled()
  })
})

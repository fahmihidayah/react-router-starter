import { createHmac } from 'node:crypto'
import { createClient } from 'redis'
import { logger } from '~/utils/logger'
import { getRateLimitRedisPrefix, getRateLimitRedisUrl } from './config.server'

const redisLogger = logger.scope('RateLimitRedis')

const CONSUME_FIXED_WINDOW_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
if ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { count, ttl }
`

function createRateLimitRedisClient() {
  return createClient({ url: getRateLimitRedisUrl() })
}

type RedisClient = ReturnType<typeof createRateLimitRedisClient>

type RateLimitValue = {
  count: number
  key: string
  lastRequest: number
}

export type RedisRateLimitDecision = {
  allowed: boolean
  retryAfterSeconds: number
}

let redisClientPromise: Promise<RedisClient> | undefined

function hashKey(value: string): string {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) throw new Error('BETTER_AUTH_SECRET is required for rate limiting')
  return createHmac('sha256', secret).update(value).digest('hex')
}

function namespacedKey(namespace: string, key: string): string {
  return `${getRateLimitRedisPrefix()}:${namespace}:${hashKey(key)}`
}

function parseConsumeResult(result: unknown): { count: number; ttlMs: number } {
  if (!Array.isArray(result) || result.length < 2) {
    throw new Error('Redis returned an invalid rate-limit result')
  }

  const count = Number(result[0])
  const ttlMs = Number(result[1])
  if (!Number.isFinite(count) || !Number.isFinite(ttlMs)) {
    throw new Error('Redis returned a non-numeric rate-limit result')
  }
  return { count, ttlMs }
}

export async function getRateLimitRedisClient(): Promise<RedisClient> {
  if (!redisClientPromise) {
    const client = createRateLimitRedisClient()
    client.on('error', (error) => redisLogger.error('Redis client error', error))
    const connection = client.connect().then(() => client)
    redisClientPromise = connection
    connection.catch(() => {
      redisClientPromise = undefined
    })
  }
  return redisClientPromise
}

export async function consumeRedisRateLimit(
  key: string,
  max: number,
  windowSeconds: number,
  namespace = 'app',
): Promise<RedisRateLimitDecision> {
  const client = await getRateLimitRedisClient()
  const result = await client.eval(CONSUME_FIXED_WINDOW_SCRIPT, {
    arguments: [String(windowSeconds * 1_000)],
    keys: [namespacedKey(namespace, key)],
  })
  const { count, ttlMs } = parseConsumeResult(result)

  return {
    allowed: count <= max,
    retryAfterSeconds: Math.max(1, Math.ceil(ttlMs / 1_000)),
  }
}

export function createBetterAuthRateLimitStorage() {
  return {
    async consume(key: string, rule: { max: number; window: number }) {
      const decision = await consumeRedisRateLimit(key, rule.max, rule.window, 'better-auth')
      return {
        allowed: decision.allowed,
        retryAfter: decision.allowed ? null : decision.retryAfterSeconds,
      }
    },
    async get(key: string): Promise<RateLimitValue | null> {
      const client = await getRateLimitRedisClient()
      const value = await client.get(namespacedKey('better-auth-legacy', key))
      if (!value) return null

      try {
        return JSON.parse(value) as RateLimitValue
      } catch {
        return null
      }
    },
    async set(key: string, value: RateLimitValue): Promise<void> {
      const client = await getRateLimitRedisClient()
      await client.set(namespacedKey('better-auth-legacy', key), JSON.stringify(value))
    },
  }
}

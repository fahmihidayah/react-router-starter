import { env } from '~/env'

export function isRateLimitingEnabled(): boolean {
  return env.RATE_LIMIT_ENABLED
}

export function getRateLimitRedisUrl(): string {
  const url = env.RATE_LIMIT_REDIS_URL || env.REDIS_URL
  if (!url && env.NODE_ENV !== 'test') {
    throw new Error('RATE_LIMIT_REDIS_URL or REDIS_URL is required when RATE_LIMIT_ENABLED is true')
  }
  // Return a dummy URL for test environment
  return url || 'redis://localhost:6379'
}

export function getRateLimitRedisPrefix(): string {
  return env.RATE_LIMIT_REDIS_PREFIX
}

export function getAuthIpAddressOptions() {
  return {
    ipAddressHeaders: env.AUTH_IP_HEADERS,
    trustedProxies: env.AUTH_TRUSTED_PROXIES,
  }
}

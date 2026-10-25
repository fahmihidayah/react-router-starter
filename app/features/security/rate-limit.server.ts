import type { BetterAuthOptions } from 'better-auth'
import { getIp } from 'better-auth/api'
import { logger } from '~/utils/logger'
import { getAuthIpAddressOptions, isRateLimitingEnabled } from './config.server'
import { consumeRedisRateLimit } from './redis-rate-limit.server'

const rateLimitLogger = logger.scope('RateLimit')

export type RateLimitPolicy = {
  max: number
  scope: string
  subjects?: string[]
  windowSeconds: number
}

export type RateLimitDecision = {
  allowed: boolean
  retryAfterSeconds: number
}

function identifierFor(request: Request): string {
  const ipOptions = getAuthIpAddressOptions()
  const options = { advanced: { ipAddress: ipOptions } } satisfies BetterAuthOptions
  return getIp(request, options) ?? 'unresolved-client'
}

export async function checkRateLimit(
  request: Request,
  policy: RateLimitPolicy,
): Promise<RateLimitDecision> {
  if (!isRateLimitingEnabled()) return { allowed: true, retryAfterSeconds: 0 }

  const subjects = [identifierFor(request), ...(policy.subjects ?? [])]
  let retryAfterSeconds = 0

  for (const subject of subjects) {
    const decision = await consumeRedisRateLimit(
      `${policy.scope}:${subject.trim().toLowerCase()}`,
      policy.max,
      policy.windowSeconds,
    )
    if (!decision.allowed) {
      retryAfterSeconds = Math.max(retryAfterSeconds, decision.retryAfterSeconds)
    }
  }

  if (retryAfterSeconds > 0) {
    rateLimitLogger.warn('Request blocked', {
      path: new URL(request.url).pathname,
      retryAfterSeconds,
      scope: policy.scope,
    })
  }

  return {
    allowed: retryAfterSeconds === 0,
    retryAfterSeconds,
  }
}

export function rateLimitHeaders(retryAfterSeconds: number): HeadersInit {
  return {
    'Cache-Control': 'no-store',
    'Retry-After': String(retryAfterSeconds),
  }
}

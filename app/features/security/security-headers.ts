import type { MiddlewareFunction } from 'react-router'
import { env } from '~/env'

const BASE_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
  'frame-src https://www.google.com https://recaptcha.google.com https://www.googletagmanager.com',
  "worker-src 'self' blob:",
]

export function getSecurityHeaders(isProduction = process.env.NODE_ENV === 'production'): Headers {
  const csp = [...BASE_CONTENT_SECURITY_POLICY]
  if (!isProduction) {
    const scriptIndex = csp.findIndex((directive) => directive.startsWith('script-src'))
    csp[scriptIndex] = `${csp[scriptIndex]} 'unsafe-eval'`
    const connectIndex = csp.findIndex((directive) => directive.startsWith('connect-src'))
    csp[connectIndex] = `${csp[connectIndex]} ws: wss:`
  } else {
    csp.push('upgrade-insecure-requests')
  }

  const headers = new Headers({
    'Content-Security-Policy': csp.join('; '),
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  })
  if (isProduction) {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  // Control search engine indexing based on ALLOW_INDEXING environment variable
  if (!env.ALLOW_INDEXING) {
    headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return headers
}

export function applySecurityHeaders(headers: Headers, isProduction?: boolean): Headers {
  for (const [name, value] of getSecurityHeaders(isProduction)) headers.set(name, value)
  return headers
}

export const securityHeadersMiddleware: MiddlewareFunction = async (_args, next) => {
  const result = await next()
  if (result instanceof Response) applySecurityHeaders(result.headers)
  return result
}

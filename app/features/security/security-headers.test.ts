import { describe, expect, it } from 'vitest'
import { applySecurityHeaders, getSecurityHeaders } from './security-headers'

describe('security headers', () => {
  it('adds production hardening and the external origins used by the app', () => {
    const headers = getSecurityHeaders(true)

    expect(headers.get('Strict-Transport-Security')).toContain('max-age=31536000')
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(headers.get('X-Frame-Options')).toBe('DENY')
    expect(headers.get('Content-Security-Policy')).toContain('https://www.googletagmanager.com')
    expect(headers.get('Content-Security-Policy')).toContain('https://www.google.com')
    expect(headers.get('Content-Security-Policy')).toContain('upgrade-insecure-requests')
  })

  it('allows the development runtime without enabling HSTS', () => {
    const headers = getSecurityHeaders(false)

    expect(headers.has('Strict-Transport-Security')).toBe(false)
    expect(headers.get('Content-Security-Policy')).toContain("'unsafe-eval'")
    expect(headers.get('Content-Security-Policy')).toContain('ws:')
  })

  it('overwrites weaker values on an existing response header collection', () => {
    const headers = new Headers({ 'X-Frame-Options': 'SAMEORIGIN' })
    applySecurityHeaders(headers, true)

    expect(headers.get('X-Frame-Options')).toBe('DENY')
  })
})

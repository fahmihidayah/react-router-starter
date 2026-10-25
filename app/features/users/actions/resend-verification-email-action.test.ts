import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ActionArgs } from '~/lib/types'

const mocks = vi.hoisted(() => ({
  emailConfigured: true,
  sendVerificationEmail: vi.fn(),
  checkRateLimit: vi.fn(),
}))

vi.mock('~/features/email/index.server', () => ({
  isEmailConfigured: () => mocks.emailConfigured,
  withEmailLocale: (headers: HeadersInit | undefined, locale: string) => {
    const result = new Headers(headers)
    result.set('x-email-locale', locale)
    return result
  },
}))
vi.mock('~/lib/auth', () => ({
  auth: { api: { sendVerificationEmail: mocks.sendVerificationEmail } },
}))
vi.mock('~/features/security/rate-limit.server', () => ({
  checkRateLimit: mocks.checkRateLimit,
}))

import { resendVerificationEmailAction } from './resend-verification-email-action'

function argsFor(email: string): ActionArgs {
  const body = new FormData()
  body.set('email', email)
  return {
    request: new Request('http://localhost/verify-email', { method: 'POST', body }),
    context: new Map(),
    params: {},
  }
}

function payload(result: unknown) {
  if (result && typeof result === 'object' && 'data' in result) return result.data
  return result
}

describe('resendVerificationEmailAction', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.emailConfigured = true
    mocks.sendVerificationEmail.mockResolvedValue({ status: true })
    mocks.checkRateLimit.mockResolvedValue({ allowed: true })
  })

  it('sends a new link with the safe verification callback', async () => {
    const result = await resendVerificationEmailAction(argsFor('ayu@example.com'))

    expect(mocks.sendVerificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          email: 'ayu@example.com',
          callbackURL: '/verify-email?status=success',
        },
      }),
    )
    expect(payload(result)).toMatchObject({ success: true })
  })

  it('rejects an invalid email without sending', async () => {
    const result = await resendVerificationEmailAction(argsFor('not-an-email'))

    expect(mocks.sendVerificationEmail).not.toHaveBeenCalled()
    expect(payload(result)).toMatchObject({ success: false, errors: { email: expect.any(Array) } })
  })

  it('reports unavailable delivery configuration', async () => {
    mocks.emailConfigured = false
    const result = await resendVerificationEmailAction(argsFor('ayu@example.com'))

    expect(mocks.sendVerificationEmail).not.toHaveBeenCalled()
    expect(payload(result)).toMatchObject({ success: false })
  })

  it('returns a retryable error when delivery fails', async () => {
    mocks.sendVerificationEmail.mockRejectedValue(new Error('SMTP unavailable'))
    const result = await resendVerificationEmailAction(argsFor('ayu@example.com'))

    expect(payload(result)).toMatchObject({ success: false })
  })
})

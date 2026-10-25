import { APIError } from 'better-auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { auth } from '~/lib/auth'
import { action } from '~/routes/track-app/settings'
import { userContext } from '../contexts'
import * as userService from '../services'

const emailMocks = vi.hoisted(() => ({
  isEmailConfigured: vi.fn(() => true),
  withEmailLocale: vi.fn((headers: HeadersInit | undefined) => new Headers(headers)),
}))
const securityMocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(() => Promise.resolve({ allowed: true, retryAfterSeconds: 0 })),
  rateLimitHeaders: vi.fn(() => ({ 'Retry-After': '60' })),
}))

vi.mock('~/features/email/index.server', () => emailMocks)
vi.mock('~/features/security/rate-limit.server', () => securityMocks)
vi.mock('../services', () => ({ deleteById: vi.fn(), update: vi.fn() }))
vi.mock('~/lib/auth', () => ({
  auth: {
    api: {
      changeEmail: vi.fn(),
      signOut: vi.fn(),
      verifyPassword: vi.fn(),
    },
  },
}))

function actionArgs(newEmail: string, currentPassword = 'current-password') {
  const formData = new FormData()
  formData.set('intent', 'requestEmailChange')
  formData.set('newEmail', newEmail)
  formData.set('currentPassword', currentPassword)

  return {
    request: new Request('https://app.example.com/track-app/settings', {
      method: 'POST',
      body: formData,
      headers: { cookie: 'better-auth.session_token=token' },
    }),
    params: {},
    context: {
      get: vi.fn((context) =>
        context === userContext
          ? { user: { id: 'user-1', email: 'current@example.com', name: 'Ayu' } }
          : undefined,
      ),
    } as never,
  }
}

describe('settings email change', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    emailMocks.isEmailConfigured.mockReturnValue(true)
    securityMocks.checkRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 })
  })

  it('verifies the password before requesting Better Auth email verification', async () => {
    const result = await action(actionArgs('new@example.com') as never)

    expect(result).toEqual({ success: true, intent: 'email-change' })
    expect(auth.api.verifyPassword).toHaveBeenCalledWith(
      expect.objectContaining({ body: { password: 'current-password' } }),
    )
    expect(auth.api.changeEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          callbackURL: '/track-app/settings?emailChanged=true',
          newEmail: 'new@example.com',
        },
      }),
    )
    expect(userService.update).not.toHaveBeenCalled()
  })

  it('does not request a change when password verification fails', async () => {
    vi.mocked(auth.api.verifyPassword).mockRejectedValue(
      APIError.from('BAD_REQUEST', { code: 'INVALID_PASSWORD', message: 'Invalid password' }),
    )

    const result = await action(actionArgs('new@example.com') as never)

    expect(result).toMatchObject({ success: false, intent: 'email-change' })
    expect(auth.api.changeEmail).not.toHaveBeenCalled()
  })

  it('rejects the current email before verifying the password', async () => {
    const result = await action(actionArgs(' CURRENT@example.com ') as never)

    expect(result).toMatchObject({ success: false, intent: 'email-change' })
    expect(auth.api.verifyPassword).not.toHaveBeenCalled()
  })

  it('returns 429 before password verification when the limit is exhausted', async () => {
    securityMocks.checkRateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 60 })

    const result = await action(actionArgs('new@example.com') as never)

    expect(result).toMatchObject({
      data: { success: false, intent: 'email-change' },
      init: { status: 429 },
    })
    expect(auth.api.verifyPassword).not.toHaveBeenCalled()
  })
})

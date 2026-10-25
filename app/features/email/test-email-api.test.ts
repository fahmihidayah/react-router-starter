import { beforeEach, describe, expect, it, vi } from 'vitest'

const emailMocks = vi.hoisted(() => {
  class EmailDeliveryError extends Error {
    constructor(readonly traceId: string) {
      super('Email delivery failed')
    }
  }

  return {
    EmailDeliveryError,
    isEmailConfigured: vi.fn(),
    isTestEmailEndpointEnabled: vi.fn(),
    resolveEmailLocale: vi.fn(() => 'en' as const),
    sendAccountActivationEmail: vi.fn(),
    sendEmailVerification: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
  }
})

const middlewareMocks = vi.hoisted(() => ({ requireApiAdmin: vi.fn() }))

vi.mock('~/features/email/index.server', () => emailMocks)
vi.mock('~/features/users/middlewares', () => middlewareMocks)

import { action, loader, middleware } from '~/routes/api/send.email'

function request(body: unknown, contentType = 'application/json') {
  return new Request('http://localhost:5173/api/send/email', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: JSON.stringify(body),
  })
}

function callAction(testRequest: Request) {
  return action({ request: testRequest } as Parameters<typeof action>[0])
}

describe('test email API', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    emailMocks.isEmailConfigured.mockReturnValue(true)
    emailMocks.isTestEmailEndpointEnabled.mockReturnValue(true)
    emailMocks.sendAccountActivationEmail.mockResolvedValue('<activation@example.com>')
    emailMocks.sendEmailVerification.mockResolvedValue('<verification@example.com>')
    emailMocks.sendPasswordResetEmail.mockResolvedValue('<reset@example.com>')
  })

  it('sends the selected template and returns its message ID', async () => {
    const response = await callAction(
      request({ to: 'learner@example.com', template: 'password-reset', name: 'Ayu' }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      success: true,
      data: {
        message: 'Test email sent.',
        messageId: '<reset@example.com>',
        recipient: 'learner@example.com',
        template: 'password-reset',
        traceId: expect.any(String),
      },
    })
    expect(emailMocks.sendPasswordResetEmail).toHaveBeenCalledWith(
      {
        email: 'learner@example.com',
        expiresInMinutes: undefined,
        locale: 'en',
        name: 'Ayu',
        resetUrl: 'http://localhost:5173/reset-password?token=email-template-test',
      },
      { traceId: expect.any(String) },
    )
  })

  it('sends the account activation template', async () => {
    const response = await callAction(
      request({
        to: 'learner@example.com',
        template: 'account-activation',
        actionUrl: 'https://example.com/activate',
      }),
    )

    expect(response.status).toBe(200)
    expect(emailMocks.sendAccountActivationEmail).toHaveBeenCalledWith(
      {
        activationUrl: 'https://example.com/activate',
        email: 'learner@example.com',
        expiresInMinutes: undefined,
        locale: 'en',
        name: undefined,
      },
      { traceId: expect.any(String) },
    )
  })

  it('sends the email verification template with its sample code', async () => {
    const response = await callAction(
      request({ to: 'learner@example.com', template: 'email-verification' }),
    )

    expect(response.status).toBe(200)
    expect(emailMocks.sendEmailVerification).toHaveBeenCalledWith(
      {
        email: 'learner@example.com',
        expiresInMinutes: undefined,
        locale: 'en',
        name: undefined,
        verificationCode: '482913',
        verificationUrl: 'http://localhost:5173/api/auth/verify-email?token=email-template-test',
      },
      { traceId: expect.any(String) },
    )
  })

  it('rejects invalid request data', async () => {
    const response = await callAction(request({ to: 'invalid', template: 'unknown' }))

    expect(response.status).toBe(400)
    expect(emailMocks.sendPasswordResetEmail).not.toHaveBeenCalled()
  })

  it('reports missing email configuration', async () => {
    emailMocks.isEmailConfigured.mockReturnValue(false)

    const response = await callAction(
      request({ to: 'learner@example.com', template: 'account-activation' }),
    )

    expect(response.status).toBe(503)
    expect(emailMocks.sendAccountActivationEmail).not.toHaveBeenCalled()
  })

  it('returns the delivery trace ID when delivery fails', async () => {
    emailMocks.sendPasswordResetEmail.mockRejectedValue(
      new emailMocks.EmailDeliveryError('trace-from-service'),
    )

    const response = await callAction(
      request({ to: 'learner@example.com', template: 'password-reset' }),
    )

    expect(response.status).toBe(502)
    expect(response.headers.get('X-Email-Trace-Id')).toBe('trace-from-service')
    expect(await response.json()).toEqual({
      success: false,
      error: 'The email could not be sent.',
      traceId: 'trace-from-service',
    })
  })

  it('returns method not allowed for GET requests', () => {
    const response = loader()

    expect(response.status).toBe(405)
    expect(response.headers.get('Allow')).toBe('POST')
  })

  it('hides the endpoint and skips the admin guard when the template tester is disabled', async () => {
    emailMocks.isTestEmailEndpointEnabled.mockReturnValue(false)
    const next = vi.fn(async () => new Response('handled'))
    const args = {} as Parameters<NonNullable<(typeof middleware)[0]>>[0]

    try {
      await middleware[0]?.(args, next)
      throw new Error('Expected the endpoint guard to reject the request')
    } catch (caught) {
      expect(caught).toBeInstanceOf(Response)
      expect((caught as Response).status).toBe(404)
    }

    expect(next).not.toHaveBeenCalled()
    expect(middlewareMocks.requireApiAdmin).not.toHaveBeenCalled()
  })

  it('requires an administrator before the handler runs in an enabled environment', async () => {
    const next = vi.fn(async () => new Response('handled'))
    const args = {} as Parameters<NonNullable<(typeof middleware)[0]>>[0]

    await middleware[0]?.(args, next)

    expect(next).toHaveBeenCalledOnce()
    expect(middleware).toHaveLength(2)
    expect(middleware[1]).toBe(middlewareMocks.requireApiAdmin)
  })
})

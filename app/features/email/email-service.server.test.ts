import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createTransport: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  provider: 'smtp' as 'smtp' | 'resend',
  resendSend: vi.fn(),
  sendMail: vi.fn(),
}))

vi.mock('nodemailer', () => ({
  default: { createTransport: mocks.createTransport },
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mocks.resendSend }
  },
}))

vi.mock('~/utils/logger', () => ({
  logger: {
    scope: () => ({
      debug: vi.fn(),
      error: mocks.error,
      info: mocks.info,
      warn: vi.fn(),
    }),
  },
}))

vi.mock('./config.server', () => ({
  getEmailDeliveryMode: () => 'direct',
  getEmailConfig: () => ({
    appName: 'Learning Tracker',
    appUrl: 'https://tracker.example.com',
    fromAddress: 'hello@example.com',
    fromName: 'Learning Tracker',
    provider: mocks.provider,
    resendApiKey: mocks.provider === 'resend' ? 'resend-secret' : undefined,
    smtp: {
      host: 'smtp.example.com',
      password: 'smtp-secret',
      port: 587,
      secure: false,
      user: 'smtp-user',
    },
    supportEmail: 'support@example.com',
  }),
}))

vi.mock('./template-renderer.server', () => ({
  renderAccountActivationEmail: vi.fn(),
  renderEmailVerification: vi.fn(),
  renderPasswordResetEmail: () => ({
    html: '<p>Secret email body</p>',
    subject: 'Reset your password',
    text: 'Secret email body',
  }),
}))

import { sendPasswordResetEmail } from './email-service.server'

describe('email delivery logging', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.provider = 'smtp'
    mocks.createTransport.mockReturnValue({ sendMail: mocks.sendMail })
    mocks.sendMail.mockResolvedValue({
      accepted: ['learner@example.com'],
      messageId: '<message@example.com>',
      pending: [],
      rejected: [],
      response: '250 Message accepted',
    })
  })

  it('sends through Resend when it is the selected provider', async () => {
    mocks.provider = 'resend'
    mocks.resendSend.mockResolvedValue({ data: { id: 'resend-message-id' }, error: null })

    const messageId = await sendPasswordResetEmail(
      {
        email: 'learner@example.com',
        resetUrl: 'https://tracker.example.com/reset-password?token=secret',
      },
      { traceId: 'trace-resend' },
    )

    expect(messageId).toBe('resend-message-id')
    expect(mocks.resendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Learning Tracker <hello@example.com>',
        to: 'learner@example.com',
        subject: 'Reset your password',
      }),
    )
    expect(mocks.createTransport).not.toHaveBeenCalled()
  })

  it('logs delivery progress with masked addresses and a trace ID', async () => {
    const messageId = await sendPasswordResetEmail(
      {
        email: 'learner@example.com',
        resetUrl: 'https://tracker.example.com/reset-password?token=secret',
      },
      { traceId: 'trace-success' },
    )

    expect(messageId).toBe('<message@example.com>')
    expect(mocks.info).toHaveBeenCalledWith(
      'Delivery started',
      expect.objectContaining({
        recipient: 'le***@example.com',
        template: 'password-reset',
        traceId: 'trace-success',
      }),
    )
    expect(mocks.info).toHaveBeenCalledWith(
      'Delivery succeeded',
      expect.objectContaining({
        accepted: ['le***@example.com'],
        messageId: '<message@example.com>',
        response: '250 Message accepted',
        traceId: 'trace-success',
      }),
    )

    const serializedLogs = JSON.stringify(mocks.info.mock.calls)
    expect(serializedLogs).not.toContain('smtp-secret')
    expect(serializedLogs).not.toContain('Secret email body')
    expect(serializedLogs).not.toContain('token=secret')
  })

  it('logs useful SMTP failure details and throws the matching trace ID', async () => {
    const smtpError = Object.assign(new Error('Authentication failed'), {
      code: 'EAUTH',
      command: 'AUTH PLAIN',
      response: '535 Credentials rejected',
      responseCode: 535,
    })
    mocks.sendMail.mockRejectedValue(smtpError)

    await expect(
      sendPasswordResetEmail(
        {
          email: 'learner@example.com',
          resetUrl: 'https://tracker.example.com/reset-password?token=secret',
        },
        { traceId: 'trace-failure' },
      ),
    ).rejects.toMatchObject({ name: 'EmailDeliveryError', traceId: 'trace-failure' })

    expect(mocks.error).toHaveBeenCalledWith(
      'Delivery failed',
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'EAUTH',
          command: 'AUTH PLAIN',
          message: 'Authentication failed',
          response: '535 Credentials rejected',
          responseCode: 535,
        }),
        recipient: 'le***@example.com',
        traceId: 'trace-failure',
      }),
    )

    const serializedLogs = JSON.stringify(mocks.error.mock.calls)
    expect(serializedLogs).not.toContain('smtp-secret')
    expect(serializedLogs).not.toContain('Secret email body')
    expect(serializedLogs).not.toContain('token=secret')
  })
})

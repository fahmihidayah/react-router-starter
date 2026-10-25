import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  renderAccountActivationEmail,
  renderEmailChangeConfirmation,
  renderEmailChangeVerification,
  renderEmailVerification,
  renderPasswordResetEmail,
} from './template-renderer.server'

const originalEnv = { ...process.env }

describe('email templates', () => {
  beforeEach(() => {
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.EMAIL_FROM = 'hello@example.com'
    process.env.EMAIL_APP_NAME = 'Learning Tracker'
    process.env.BETTER_AUTH_URL = 'https://tracker.example.com'
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('renders a branded password reset email with escaped user input', () => {
    const email = renderPasswordResetEmail({
      name: '<script>alert(1)</script>',
      email: 'learner@example.com',
      resetUrl: 'https://tracker.example.com/reset-password?token=secret',
    })

    expect(email.subject).toBe('Reset your Learning Tracker password')
    expect(email.html).toContain('Learning Tracker')
    expect(email.html).toContain('learner@example.com')
    expect(email.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(email.html).not.toContain('<script>alert(1)</script>')
    expect(email.html).toContain("font-family: 'Plus Jakarta Sans'")
    expect(email.html).toContain('family=Plus+Jakarta+Sans')
    expect(email.html).toContain('background-color: #2f39a9')
    expect(email.html).not.toContain('var(--tw-')
    expect(email.html).not.toContain('@layer')
    expect(email.text).toContain('https://tracker.example.com/reset-password?token=secret')
  })

  it('renders an email verification code and link', () => {
    const email = renderEmailVerification({
      name: 'Ayu',
      email: 'ayu@example.com',
      verificationCode: '482913',
      verificationUrl: 'https://tracker.example.com/verify-email?token=secret',
    })

    expect(email.subject).toBe('Verify your email for Learning Tracker')
    expect(email.html).toContain('482913')
    expect(email.html).toContain('Verify email address')
    expect(email.text).toContain('Verification code: 482913')
  })

  it('renders the activation email sent after public registration', () => {
    const email = renderAccountActivationEmail({
      name: 'Ayu',
      email: 'ayu@example.com',
      activationUrl: 'https://tracker.example.com/verify-email?token=activation-token',
    })

    expect(email.subject).toBe('Activate your Learning Tracker account')
    expect(email.html).toContain('Activate your account')
    expect(email.html).toContain('Activate account')
    expect(email.html).toContain('ayu@example.com')
    expect(email.text).toContain('verify-email?token=activation-token')
  })

  it('requires at least one email verification method', () => {
    expect(() => renderEmailVerification({ email: 'ayu@example.com' })).toThrow(
      'Email verification requires a verificationUrl or verificationCode',
    )
  })

  it('renders both steps of a verified email change', () => {
    const confirmation = renderEmailChangeConfirmation({
      confirmationUrl: 'https://tracker.example.com/verify-email?token=old-address-token',
      email: 'old@example.com',
      name: 'Ayu',
      newEmail: 'new@example.com',
    })
    const verification = renderEmailChangeVerification({
      email: 'new@example.com',
      name: 'Ayu',
      verificationUrl: 'https://tracker.example.com/verify-email?token=new-address-token',
    })

    expect(confirmation.subject).toBe('Confirm your Learning Tracker email change')
    expect(confirmation.text).toContain('old@example.com')
    expect(confirmation.text).toContain('new@example.com')
    expect(verification.subject).toBe('Verify your new email for Learning Tracker')
    expect(verification.text).toContain('new-address-token')
  })

  it('renders all authentication templates in Indonesian', () => {
    const reset = renderPasswordResetEmail({
      email: 'ayu@example.com',
      locale: 'id',
      name: 'Ayu',
      resetUrl: 'https://tracker.example.com/reset-password?token=secret',
    })
    const activation = renderAccountActivationEmail({
      activationUrl: 'https://tracker.example.com/verify-email?token=activation-token',
      email: 'ayu@example.com',
      locale: 'id',
      name: 'Ayu',
    })
    const verification = renderEmailVerification({
      email: 'ayu@example.com',
      locale: 'id',
      name: 'Ayu',
      verificationCode: '482913',
      verificationUrl: 'https://tracker.example.com/verify-email?token=secret',
    })

    expect(reset.subject).toBe('Atur ulang kata sandi Learning Tracker Anda')
    expect(reset.html).toContain('<html lang="id">')
    expect(reset.html).toContain('Atur ulang kata sandi Anda')
    expect(reset.html).toContain('Butuh bantuan?')
    expect(reset.text).toContain('Kami menerima permintaan')

    expect(activation.subject).toBe('Aktifkan akun Learning Tracker Anda')
    expect(activation.html).toContain('Aktifkan akun Anda')
    expect(activation.text).toContain('Selamat datang di Learning Tracker')

    expect(verification.subject).toBe('Verifikasi email Anda untuk Learning Tracker')
    expect(verification.html).toContain('Kode verifikasi')
    expect(verification.text).toContain('Kode verifikasi: 482913')
  })
})

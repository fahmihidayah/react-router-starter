import { describe, expect, it } from 'vitest'
import { getEmailVerificationPath, isEmailNotVerifiedError } from './email-verification'

describe('email verification helpers', () => {
  it('builds an encoded verification page URL', () => {
    expect(getEmailVerificationPath('ayu+family@example.com')).toBe(
      '/verify-email?email=ayu%2Bfamily%40example.com',
    )
    expect(getEmailVerificationPath()).toBe('/verify-email')
  })

  it('recognizes Better Auth email verification errors', () => {
    expect(isEmailNotVerifiedError({ code: 'EMAIL_NOT_VERIFIED' })).toBe(true)
    expect(isEmailNotVerifiedError({ message: 'Email is not verified' })).toBe(true)
    expect(isEmailNotVerifiedError({ code: 'INVALID_EMAIL_OR_PASSWORD' })).toBe(false)
  })
})

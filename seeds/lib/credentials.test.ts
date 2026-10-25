import { describe, expect, it } from 'vitest'
import {
  BootstrapCredentialError,
  DEFAULT_ADMIN_NAME,
  resolveBootstrapAdminCredentials,
} from './credentials'

const strongPassword = 'S3cure-Learning-Passphrase'

describe('resolveBootstrapAdminCredentials', () => {
  it('reads the administrator identity from the environment', () => {
    expect(
      resolveBootstrapAdminCredentials({
        ADMIN_EMAIL: 'owner@example.com',
        ADMIN_NAME: 'Owner',
        ADMIN_PASSWORD: strongPassword,
      }),
    ).toEqual({
      email: 'owner@example.com',
      name: 'Owner',
      password: strongPassword,
    })
  })

  it('falls back to the default administrator name', () => {
    const credentials = resolveBootstrapAdminCredentials({
      ADMIN_EMAIL: 'owner@example.com',
      ADMIN_PASSWORD: strongPassword,
    })

    expect(credentials.name).toBe(DEFAULT_ADMIN_NAME)
  })

  it('requires an email and a password', () => {
    expect(() => resolveBootstrapAdminCredentials({ ADMIN_PASSWORD: strongPassword })).toThrow(
      BootstrapCredentialError,
    )
    expect(() => resolveBootstrapAdminCredentials({ ADMIN_EMAIL: 'owner@example.com' })).toThrow(
      BootstrapCredentialError,
    )
    expect(() => resolveBootstrapAdminCredentials({})).toThrow(/ADMIN_EMAIL is required/)
  })

  it('rejects an invalid email address', () => {
    expect(() =>
      resolveBootstrapAdminCredentials({
        ADMIN_EMAIL: 'not-an-email',
        ADMIN_PASSWORD: strongPassword,
      }),
    ).toThrow(/valid email/)
  })

  it('rejects the password that previously shipped in the repository', () => {
    expect(() =>
      resolveBootstrapAdminCredentials({
        ADMIN_EMAIL: 'owner@example.com',
        ADMIN_PASSWORD: 'Test@1234',
      }),
    ).toThrow(/known default password/)
  })

  it('rejects other well-known default passwords regardless of case', () => {
    for (const password of ['Password', 'CHANGEME', 'letmein']) {
      expect(() =>
        resolveBootstrapAdminCredentials({
          ADMIN_EMAIL: 'owner@example.com',
          ADMIN_PASSWORD: password,
        }),
      ).toThrow(/known default password/)
    }
  })

  it('requires a stronger password in production', () => {
    expect(() =>
      resolveBootstrapAdminCredentials({
        ADMIN_EMAIL: 'owner@example.com',
        ADMIN_PASSWORD: 'Short#12',
        NODE_ENV: 'production',
      }),
    ).toThrow(/at least 12 characters/)

    expect(
      resolveBootstrapAdminCredentials({
        ADMIN_EMAIL: 'owner@example.com',
        ADMIN_PASSWORD: 'Short#12',
        NODE_ENV: 'development',
      }).password,
    ).toBe('Short#12')
  })

  it('rejects a production password that contains the email local part', () => {
    expect(() =>
      resolveBootstrapAdminCredentials({
        ADMIN_EMAIL: 'owner@example.com',
        ADMIN_PASSWORD: 'owner-strong-passphrase',
        NODE_ENV: 'production',
      }),
    ).toThrow(/email local part/)
  })

  it('does not leak credential values in error messages', () => {
    try {
      resolveBootstrapAdminCredentials({
        ADMIN_EMAIL: 'owner@example.com',
        ADMIN_PASSWORD: 'Test@1234',
      })
      throw new Error('Expected the credential check to reject the password')
    } catch (error) {
      expect(error).toBeInstanceOf(BootstrapCredentialError)
      expect((error as Error).message).not.toContain('Test@1234')
      expect((error as Error).message).not.toContain('owner@example.com')
    }
  })
})

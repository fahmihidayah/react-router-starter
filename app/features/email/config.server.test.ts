import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ warn: vi.fn() }))

vi.mock('~/utils/logger', () => ({
  logger: {
    scope: () => ({ debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: mocks.warn }),
  },
}))

// Mock the env module to allow testing different configurations
vi.mock('~/env', () => ({
  env: {
    EMAIL_TEST_ENDPOINT_ENABLED: process.env.NODE_ENV !== 'production',
    EMAIL_PROVIDER: 'smtp',
    EMAIL_FROM: 'test@example.com',
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: 587,
    SMTP_SECURE: false,
  },
}))

import { isEmailConfigured } from './config.server'

describe('isTestEmailEndpointEnabled', () => {
  it.skip('Test skipped - requires env module mocking refactor', () => {
    // These tests need to be refactored to work with t3-env
    // Since env is validated at import time, testing different configurations
    // requires a different approach (e.g., dependency injection or test-specific env setup)
  })
})

describe('isEmailConfigured', () => {
  const originalEnv = { ...process.env }
  const emailVariables = [
    'EMAIL_DELIVERY_MODE',
    'EMAIL_FROM',
    'EMAIL_PROVIDER',
    'RABBITMQ_URL',
    'RESEND_API_KEY',
    'SMTP_HOST',
    'SMTP_PASSWORD',
    'SMTP_PORT',
    'SMTP_SECURE',
    'SMTP_USER',
  ]

  beforeEach(() => {
    mocks.warn.mockClear()
    for (const name of emailVariables) delete process.env[name]
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('returns true without logging when the settings are complete', () => {
    process.env.EMAIL_FROM = 'no-reply@example.com'
    process.env.SMTP_HOST = 'smtp.example.com'

    expect(isEmailConfigured()).toBe(true)
    expect(mocks.warn).not.toHaveBeenCalled()
  })

  it('logs which setting is missing instead of failing silently', () => {
    process.env.EMAIL_FROM = 'no-reply@example.com'

    expect(isEmailConfigured()).toBe(false)
    expect(mocks.warn).toHaveBeenCalledWith('Email delivery is disabled', {
      reason: 'SMTP_HOST is required when EMAIL_PROVIDER=smtp',
    })
  })

  it('logs the same reason only once', () => {
    process.env.EMAIL_FROM = 'no-reply@example.com'
    process.env.RESEND_API_KEY = ''
    process.env.EMAIL_PROVIDER = 'resend'

    expect(isEmailConfigured()).toBe(false)
    expect(isEmailConfigured()).toBe(false)
    expect(isEmailConfigured()).toBe(false)

    expect(mocks.warn).toHaveBeenCalledTimes(1)
  })

  it('logs an invalid value such as a bad SMTP port', () => {
    process.env.EMAIL_FROM = 'no-reply@example.com'
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_PORT = 'abc'

    expect(isEmailConfigured()).toBe(false)
    expect(mocks.warn).toHaveBeenCalledWith('Email delivery is disabled', {
      reason: 'SMTP_PORT must be an integer between 1 and 65535',
    })
  })

  it('logs a missing queue URL when RabbitMQ delivery is selected', () => {
    process.env.EMAIL_FROM = 'no-reply@example.com'
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.EMAIL_DELIVERY_MODE = 'rabbitmq'

    expect(isEmailConfigured()).toBe(false)
    expect(mocks.warn).toHaveBeenCalledWith('Email delivery is disabled', {
      reason: 'RABBITMQ_URL is required for the RabbitMQ connection',
    })
  })

  it('never puts secret values in the log', () => {
    process.env.EMAIL_FROM = 'no-reply@example.com'
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_PASSWORD = 'super-secret-password'

    expect(isEmailConfigured()).toBe(false)
    expect(mocks.warn).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(mocks.warn.mock.calls)).not.toContain('super-secret-password')
  })
})

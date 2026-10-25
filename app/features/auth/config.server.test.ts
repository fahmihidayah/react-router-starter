import { afterEach, describe, expect, it } from 'vitest'
import { getAuthFeatureConfig, getPublicAuthFeatureConfig } from './config.server'

const featureEnvironmentNames = [
  'GOOGLE_AUTH_ENABLED',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'RECAPTCHA_ENABLED',
  'RECAPTCHA_SITE_KEY',
  'RECAPTCHA_SECRET_KEY',
] as const

const originalEnvironment = Object.fromEntries(
  featureEnvironmentNames.map((name) => [name, process.env[name]]),
)

afterEach(() => {
  for (const name of featureEnvironmentNames) {
    const originalValue = originalEnvironment[name]
    if (originalValue === undefined) delete process.env[name]
    else process.env[name] = originalValue
  }
})

describe('authentication feature configuration', () => {
  it('keeps optional authentication features disabled by default', () => {
    for (const name of featureEnvironmentNames) delete process.env[name]

    expect(getAuthFeatureConfig()).toEqual({
      google: { enabled: false },
      recaptcha: { enabled: false },
    })
  })

  it('loads enabled features and exposes only public browser configuration', () => {
    process.env.GOOGLE_AUTH_ENABLED = 'true'
    process.env.GOOGLE_CLIENT_ID = 'google-client-id'
    process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret'
    process.env.RECAPTCHA_ENABLED = 'true'
    process.env.RECAPTCHA_SITE_KEY = 'recaptcha-site-key'
    process.env.RECAPTCHA_SECRET_KEY = 'recaptcha-secret-key'

    expect(getPublicAuthFeatureConfig()).toEqual({
      googleEnabled: true,
      recaptcha: { enabled: true, siteKey: 'recaptcha-site-key' },
    })
  })

  it('fails fast when an enabled feature is missing a credential', () => {
    process.env.GOOGLE_AUTH_ENABLED = 'true'
    delete process.env.GOOGLE_CLIENT_ID
    process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret'

    expect(() => getAuthFeatureConfig()).toThrow('GOOGLE_CLIENT_ID is required')
  })
})

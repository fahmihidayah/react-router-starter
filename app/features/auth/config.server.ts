import { env } from '~/env'

export type AuthFeatureConfig = {
  google:
    | { enabled: true; clientId: string; clientSecret: string }
    | { enabled: false; clientId?: never; clientSecret?: never }
  recaptcha:
    | { enabled: true; siteKey: string; secretKey: string }
    | { enabled: false; siteKey?: never; secretKey?: never }
}

export function getAuthFeatureConfig(): AuthFeatureConfig {
  return {
    google: env.GOOGLE_AUTH_ENABLED
      ? {
          enabled: true,
          clientId: env.GOOGLE_CLIENT_ID!,
          clientSecret: env.GOOGLE_CLIENT_SECRET!,
        }
      : { enabled: false },
    recaptcha: env.RECAPTCHA_ENABLED
      ? {
          enabled: true,
          siteKey: env.RECAPTCHA_SITE_KEY!,
          secretKey: env.RECAPTCHA_SECRET_KEY!,
        }
      : { enabled: false },
  }
}

export function getPublicAuthFeatureConfig() {
  const config = getAuthFeatureConfig()

  return {
    googleEnabled: config.google.enabled,
    recaptcha: config.recaptcha.enabled
      ? {
          enabled: true as const,
          siteKey: config.recaptcha.siteKey,
        }
      : {
          enabled: false as const,
          siteKey: null,
        },
  }
}

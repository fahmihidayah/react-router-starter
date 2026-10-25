import { env } from '~/env'
import { getRabbitMqConfig } from '~/features/queue/index.server'
import { logger } from '~/utils/logger'

const configLogger = logger.scope('Email')
const reportedConfigurationProblems = new Set<string>()

export type TEmailProvider = 'smtp' | 'resend'
export type TEmailDeliveryMode = 'direct' | 'rabbitmq'

export type TEmailConfig = {
  appName: string
  appUrl: string
  fromAddress: string
  fromName: string
  logoUrl?: string
  provider: TEmailProvider
  replyTo?: string
  resendApiKey?: string
  smtp?: {
    host: string
    port: number
    secure: boolean
    user?: string
    password?: string
  }
  supportEmail: string
}

/**
 * Controls the template test endpoint used to preview authentication emails.
 * The endpoint is admin-only; this flag additionally removes it from production unless an
 * operator explicitly opts in with `EMAIL_TEST_ENDPOINT_ENABLED=true`.
 */
export function isTestEmailEndpointEnabled(): boolean {
  return env.EMAIL_TEST_ENDPOINT_ENABLED
}

export function getEmailProvider(): TEmailProvider {
  return env.EMAIL_PROVIDER
}

export function getEmailDeliveryMode(): TEmailDeliveryMode {
  return env.EMAIL_DELIVERY_MODE
}

export function getEmailQueueName(): string {
  return env.EMAIL_QUEUE_NAME
}

/**
 * Returns false when email cannot be sent, which also turns off required email verification.
 * That is intended for local development, but a typo in an environment variable must not do the
 * same thing silently, so the reason is logged once. The messages only name variables, never values.
 */
export function isEmailConfigured(): boolean {
  try {
    getEmailConfig()
    if (getEmailDeliveryMode() === 'rabbitmq') getRabbitMqConfig()
    return true
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    if (!reportedConfigurationProblems.has(reason)) {
      reportedConfigurationProblems.add(reason)
      configLogger.warn('Email delivery is disabled', { reason })
    }
    return false
  }
}

export function getEmailConfig(): TEmailConfig {
  const provider = env.EMAIL_PROVIDER
  const fromAddress = env.EMAIL_FROM

  const config: TEmailConfig = {
    appName: env.EMAIL_APP_NAME,
    appUrl: env.BETTER_AUTH_URL,
    fromAddress,
    fromName: env.EMAIL_FROM_NAME,
    logoUrl: env.EMAIL_LOGO_URL,
    provider,
    replyTo: env.EMAIL_REPLY_TO,
    supportEmail: env.EMAIL_SUPPORT_ADDRESS || env.EMAIL_REPLY_TO || fromAddress,
  }

  if (provider === 'resend') {
    const resendApiKey = env.RESEND_API_KEY
    if (!resendApiKey) throw new Error('RESEND_API_KEY is required when EMAIL_PROVIDER=resend')
    return { ...config, resendApiKey }
  }

  const host = env.SMTP_HOST
  if (!host) throw new Error('SMTP_HOST is required when EMAIL_PROVIDER=smtp')

  return {
    ...config,
    smtp: {
      host,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      user: env.SMTP_USER,
      password: env.SMTP_PASSWORD,
    },
  }
}

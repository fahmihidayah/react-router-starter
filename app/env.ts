import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

/**
 * Centralized environment variable validation using t3-env.
 * All environment variables are defined, validated, and typed here.
 * Import { env } from '~/env' throughout the application.
 */

// Helper transformers for common patterns
const booleanString = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => value === 'true')
  .pipe(z.boolean())

const optionalUrl = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().url().optional(),
)

const commaDelimitedList = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim() !== '' ? value.split(',').map((v) => v.trim()) : [],
  z.array(z.string()),
)

const portNumber = z.coerce.number().int().min(1).max(65535)

const positiveInteger = z.coerce.number().int().positive()

export const env = createEnv({
  /**
   * Specify what prefix the client-side variables must have.
   * This is enforced both at build-time and at runtime.
   */
  clientPrefix: 'PUBLIC_',

  /**
   * Server-side environment variables.
   * These are never exposed to the client.
   */
  server: {
    // ============================================
    // Core Application
    // ============================================
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: portNumber.default(3000),

    // ============================================
    // Database
    // ============================================
    DATABASE_URL: z.string().url(),

    // ============================================
    // Admin Bootstrap
    // ============================================
    ADMIN_EMAIL: z.string().email().optional(),
    ADMIN_PASSWORD: z.string().min(8).optional(),
    ADMIN_NAME: z.string().min(1).optional(),

    // ============================================
    // Better Auth
    // ============================================
    BETTER_AUTH_SECRET: z.string().min(16),
    BETTER_AUTH_URL: z.string().url(),

    // ============================================
    // Google OAuth (Optional)
    // ============================================
    GOOGLE_AUTH_ENABLED: booleanString.default(false),
    GOOGLE_CLIENT_ID: z
      .string()
      .min(1)
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),
    GOOGLE_CLIENT_SECRET: z
      .string()
      .min(1)
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),

    // ============================================
    // reCAPTCHA (Optional)
    // ============================================
    RECAPTCHA_ENABLED: booleanString.default(false),
    RECAPTCHA_SITE_KEY: z
      .string()
      .min(1)
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),
    RECAPTCHA_SECRET_KEY: z
      .string()
      .min(1)
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),

    // ============================================
    // Security and Rate Limiting
    // ============================================
    RATE_LIMIT_ENABLED: z
      .enum(['true', 'false'])
      .optional()
      .transform((value) => {
        // Default to enabled in production, disabled elsewhere
        if (value === undefined) {
          return process.env.NODE_ENV === 'production'
        }
        return value === 'true'
      })
      .pipe(z.boolean()),
    RATE_LIMIT_REDIS_URL: z
      .string()
      .url()
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),
    REDIS_URL: z
      .string()
      .url()
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined), // Fallback for RATE_LIMIT_REDIS_URL
    RATE_LIMIT_REDIS_PREFIX: z.string().min(1).default('learning-tracker:rate-limit'),
    AUTH_IP_HEADERS: commaDelimitedList.default(['x-forwarded-for']),
    AUTH_TRUSTED_PROXIES: commaDelimitedList,

    // ============================================
    // Email Configuration
    // ============================================
    EMAIL_PROVIDER: z.enum(['smtp', 'resend']).default('smtp'),
    EMAIL_DELIVERY_MODE: z.enum(['direct', 'rabbitmq']).default('direct'),
    EMAIL_TEST_ENDPOINT_ENABLED: z
      .enum(['true', 'false'])
      .optional()
      .transform((value, ctx) => {
        // Default to enabled outside production, disabled in production
        if (value === undefined) {
          return process.env.NODE_ENV !== 'production'
        }
        return value === 'true'
      })
      .pipe(z.boolean()),

    // SMTP Settings
    SMTP_HOST: z
      .string()
      .min(1)
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),
    SMTP_PORT: portNumber.default(587),
    SMTP_SECURE: booleanString.default(false),
    SMTP_USER: z
      .string()
      .min(1)
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),
    SMTP_PASSWORD: z
      .string()
      .min(1)
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),

    // Resend Settings
    RESEND_API_KEY: z
      .string()
      .min(1)
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),

    // RabbitMQ Settings
    RABBITMQ_URL: z
      .string()
      .url()
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),
    RABBITMQ_PREFETCH: positiveInteger.default(5),
    RABBITMQ_REQUEUE_ON_FAILURE: booleanString.default(false),
    EMAIL_QUEUE_NAME: z.string().min(1).default('emails'),

    // Email Identity
    EMAIL_FROM: z.string().email(),
    EMAIL_FROM_NAME: z.string().min(1).default('Learning Tracker'),
    EMAIL_REPLY_TO: z.string().email().optional(),
    EMAIL_SUPPORT_ADDRESS: z.string().email().optional(),
    EMAIL_APP_NAME: z.string().min(1).default('Learning Tracker'),
    EMAIL_LOGO_URL: optionalUrl,

    // ============================================
    // Media Upload
    // ============================================
    MEDIA_STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),

    // Local Storage
    MEDIA_UPLOAD_DIR: z.string().min(1).default('./uploads/media'),
    MEDIA_LOCAL_BASE_URL: z.string().min(1).default('/api/media/files'),

    // Image Processing
    MEDIA_MAX_FILE_SIZE: positiveInteger.default(10485760), // 10MB
    MEDIA_WEBP_QUALITY: z.coerce.number().int().min(1).max(100).default(82),

    // S3 Storage
    AWS_REGION: z.string().min(1).optional().default('us-east-1'),
    AWS_ACCESS_KEY_ID: z
      .string()
      .min(1)
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),
    AWS_SECRET_ACCESS_KEY: z
      .string()
      .min(1)
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),
    S3_BUCKET: z
      .string()
      .min(1)
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),
    S3_MEDIA_PREFIX: z.string().min(1).default('media'),
    S3_ENDPOINT: z
      .string()
      .url()
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),
    S3_PUBLIC_URL: z
      .string()
      .url()
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),
    S3_FORCE_PATH_STYLE: booleanString.default(false),

    // ============================================
    // Analytics
    // ============================================
    GTM_CONTAINER_ID: z
      .string()
      .regex(/^GTM-[A-Z0-9]+$/, 'Must be a valid GTM container ID (GTM-XXXXXXX)')
      .optional()
      .or(z.literal(''))
      .transform((val) => val || undefined),

    // ============================================
    // Privacy & Consent
    // ============================================
    CONSENT_BANNER_ENABLED: booleanString.default(true),

    // ============================================
    // SEO & Indexing
    // ============================================
    ALLOW_INDEXING: booleanString.default(false),

    // ============================================
    // Observability (Optional)
    // ============================================
    OBSERVABILITY_METRICS_ENABLED: booleanString.default(false),
    OBSERVABILITY_METRICS_TOKEN: z.string().min(16).optional(),
    OBSERVABILITY_SENTRY_DSN: optionalUrl,
    OBSERVABILITY_ENVIRONMENT: z.string().min(1).optional(),
    OBSERVABILITY_RELEASE: z.string().min(1).optional(),
  },

  /**
   * Client-side environment variables.
   * These are exposed to the browser and must be prefixed with a public identifier.
   * Currently, this application has no client-side environment variables.
   */
  client: {},

  /**
   * Runtime environment object to read from.
   * In most cases, this should be process.env.
   */
  runtimeEnv: process.env,

  /**
   * Skip validation during build if desired.
   * Set to true if you want to validate only at runtime.
   * We skip validation during tests to allow test-specific environment setups.
   */
  skipValidation: process.env.NODE_ENV === 'test',

  /**
   * Custom error formatter for better error messages.
   */
  onValidationError: (error) => {
    console.error('❌ Invalid environment variables:')
    console.error(error)
    throw new Error('Invalid environment variables')
  },

  /**
   * Additional runtime validations that depend on multiple variables.
   * These run after the individual field validations pass.
   */
  // We'll use a custom validation function after env is created
})

// ============================================
// Cross-field validations
// ============================================

// Validate Google OAuth requirements
if (env.GOOGLE_AUTH_ENABLED) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error(
      'Invalid environment: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required when GOOGLE_AUTH_ENABLED=true',
    )
  }
}

// Validate reCAPTCHA requirements
if (env.RECAPTCHA_ENABLED) {
  if (!env.RECAPTCHA_SITE_KEY || !env.RECAPTCHA_SECRET_KEY) {
    throw new Error(
      'Invalid environment: RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY are required when RECAPTCHA_ENABLED=true',
    )
  }
}

// Validate rate limiting requirements (skip in test environment)
if (env.RATE_LIMIT_ENABLED && env.NODE_ENV !== 'test') {
  const redisUrl = env.RATE_LIMIT_REDIS_URL || env.REDIS_URL
  if (!redisUrl) {
    throw new Error(
      'Invalid environment: RATE_LIMIT_REDIS_URL (or REDIS_URL) is required when RATE_LIMIT_ENABLED=true',
    )
  }
}

// Validate SMTP requirements (SMTP_USER and SMTP_PASSWORD must be provided together)
if (env.EMAIL_PROVIDER === 'smtp') {
  const hasUser = !!env.SMTP_USER
  const hasPassword = !!env.SMTP_PASSWORD
  if (hasUser !== hasPassword) {
    throw new Error(
      'Invalid environment: SMTP_USER and SMTP_PASSWORD must be provided together or both omitted',
    )
  }
}

// Validate Resend requirements
if (env.EMAIL_PROVIDER === 'resend' && !env.RESEND_API_KEY) {
  throw new Error('Invalid environment: RESEND_API_KEY is required when EMAIL_PROVIDER=resend')
}

// Validate S3 requirements
if (env.MEDIA_STORAGE_DRIVER === 's3') {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.S3_BUCKET) {
    throw new Error(
      'Invalid environment: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET are required when MEDIA_STORAGE_DRIVER=s3',
    )
  }
}

// Validate observability requirements
if (
  env.NODE_ENV === 'production' &&
  env.OBSERVABILITY_METRICS_ENABLED &&
  !env.OBSERVABILITY_METRICS_TOKEN
) {
  throw new Error(
    'Invalid environment: OBSERVABILITY_METRICS_TOKEN is required in production when OBSERVABILITY_METRICS_ENABLED=true',
  )
}

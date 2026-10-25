import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, captcha } from 'better-auth/plugins'
import * as schema from '../db/schema'
import { env } from '../env'
import { getAuthFeatureConfig } from '../features/auth/config.server'
import {
  isEmailConfigured,
  resolveEmailLocale,
  sendAccountActivationEmail,
  sendEmailChangeConfirmation,
  sendEmailChangeVerification,
  sendEmailVerification,
  sendPasswordResetEmail,
} from '../features/email/index.server'
import { getAuthIpAddressOptions, isRateLimitingEnabled } from '../features/security/config.server'
import { createBetterAuthRateLimitStorage } from '../features/security/redis-rate-limit.server'
import { assignRoleByKey, findById } from '../features/users/queries'
import { db } from './database'

const emailEnabled = isEmailConfigured()
const authEmailTokenExpiresInSeconds = 60 * 60
const authEmailTokenExpiresInMinutes = authEmailTokenExpiresInSeconds / 60
const authSecret = env.BETTER_AUTH_SECRET
const authBaseUrl = env.BETTER_AUTH_URL
const authFeatures = getAuthFeatureConfig()

// Diagnostic logging for auth configuration
const useSecureCookies = env.NODE_ENV === 'production'
console.log('[Auth Config] Better Auth initialization:', {
  nodeEnv: env.NODE_ENV,
  baseUrl: authBaseUrl,
  useSecureCookies,
  isHttps: authBaseUrl.startsWith('https'),
  warning:
    useSecureCookies && !authBaseUrl.startsWith('https')
      ? '⚠️  SECURE COOKIES ENABLED BUT USING HTTP - Cookies will be rejected by browsers!'
      : null,
})

function isSignUpEmailRequest(request?: Request): boolean {
  if (!request) return false

  try {
    return new URL(request.url).pathname.endsWith('/sign-up/email')
  } catch {
    return false
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  advanced: {
    ipAddress: getAuthIpAddressOptions(),
    useSecureCookies: env.NODE_ENV === 'production',
  },
  rateLimit: {
    enabled: isRateLimitingEnabled(),
    customStorage: isRateLimitingEnabled() ? createBetterAuthRateLimitStorage() : undefined,
    max: 100,
    window: 15 * 60,
    customRules: {
      '/change-email': { max: 3, window: 15 * 60 },
      '/change-password': { max: 5, window: 15 * 60 },
      '/request-password-reset': { max: 3, window: 15 * 60 },
      '/send-verification-email': { max: 3, window: 15 * 60 },
      '/sign-in/email': { max: 5, window: 60 },
      '/sign-in/social': { max: 10, window: 60 },
      '/sign-up/email': { max: 5, window: 15 * 60 },
    },
  },
  emailAndPassword: {
    enabled: true,
    // Keep local development usable when email is intentionally not configured.
    // In configured environments, no credential session is created before verification.
    requireEmailVerification: emailEnabled,
    ...(emailEnabled
      ? {
          sendResetPassword: async ({ user, url }, request) => {
            await sendPasswordResetEmail({
              name: user.name,
              email: user.email,
              locale: resolveEmailLocale(request),
              resetUrl: url,
              expiresInMinutes: authEmailTokenExpiresInMinutes,
            })
          },
          resetPasswordTokenExpiresIn: authEmailTokenExpiresInSeconds,
        }
      : {}),
  },
  emailVerification: emailEnabled
    ? {
        autoSignInAfterVerification: true,
        expiresIn: authEmailTokenExpiresInSeconds,
        // The public registration form uses signUpEmail, so Better Auth invokes this after signup.
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }, request) => {
          const locale = resolveEmailLocale(request)

          if (isSignUpEmailRequest(request)) {
            await sendAccountActivationEmail({
              name: user.name,
              email: user.email,
              locale,
              activationUrl: url,
              expiresInMinutes: authEmailTokenExpiresInMinutes,
            })
            return
          }

          const persistedUser = await findById(user.id)
          if (persistedUser && persistedUser.email.toLowerCase() !== user.email.toLowerCase()) {
            await sendEmailChangeVerification({
              name: user.name,
              email: user.email,
              locale,
              verificationUrl: url,
              expiresInMinutes: authEmailTokenExpiresInMinutes,
            })
            return
          }

          await sendEmailVerification({
            name: user.name,
            email: user.email,
            locale,
            verificationUrl: url,
            expiresInMinutes: authEmailTokenExpiresInMinutes,
          })
        },
      }
    : undefined,
  user: emailEnabled
    ? {
        changeEmail: {
          enabled: true,
          updateEmailWithoutVerification: false,
          sendChangeEmailConfirmation: async ({ user, newEmail, url }, request) => {
            await sendEmailChangeConfirmation({
              confirmationUrl: url,
              email: user.email,
              expiresInMinutes: authEmailTokenExpiresInMinutes,
              locale: resolveEmailLocale(request),
              name: user.name,
              newEmail,
            })
          },
        },
      }
    : { changeEmail: { enabled: false } },
  socialProviders: authFeatures.google.enabled
    ? {
        google: {
          clientId: authFeatures.google.clientId,
          clientSecret: authFeatures.google.clientSecret,
        },
      }
    : undefined,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await assignRoleByKey(user.id, 'user')
        },
      },
    },
  },
  plugins: [
    admin(),
    ...(authFeatures.recaptcha.enabled
      ? [
          captcha({
            provider: 'google-recaptcha',
            secretKey: authFeatures.recaptcha.secretKey,
            endpoints: ['/sign-up/email', '/sign-in/email', '/sign-in/social'],
          }),
        ]
      : []),
  ],
  secret: authSecret,
  baseURL: authBaseUrl,
})

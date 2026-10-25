import { data } from 'react-router'
import { isEmailConfigured, withEmailLocale } from '~/features/email/index.server'
import { checkRateLimit, rateLimitHeaders } from '~/features/security/rate-limit.server'
import { auth } from '~/lib/auth'
import type { ActionArgs } from '~/lib/types'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import { forgotPasswordSchema } from '../schemas/form/user-schema'

export type TForgotPasswordActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[] | undefined>
}

export async function forgotPasswordAction(args: ActionArgs) {
  const formData = await args.request.formData()
  const result = forgotPasswordSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return data<TForgotPasswordActionResponse>(
      {
        success: false,
        message: 'Check the email address and try again.',
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    )
  }

  const limit = await checkRateLimit(args.request, {
    max: 3,
    scope: 'forgot-password',
    subjects: [result.data.email],
    windowSeconds: 15 * 60,
  })
  if (!limit.allowed) {
    return data<TForgotPasswordActionResponse>(
      { success: false, message: m.auth_rate_limit_exceeded() },
      { status: 429, headers: rateLimitHeaders(limit.retryAfterSeconds) },
    )
  }

  if (!isEmailConfigured()) {
    return data<TForgotPasswordActionResponse>(
      {
        success: false,
        message: 'Password reset email is not configured yet. Contact an administrator for help.',
      },
      { status: 503 },
    )
  }

  try {
    await auth.api.requestPasswordReset({
      body: {
        email: result.data.email,
        redirectTo: new URL('/reset-password', args.request.url).toString(),
      },
      headers: withEmailLocale(args.request.headers, getLocale()),
    })

    return data<TForgotPasswordActionResponse>({
      success: true,
      message: 'If an account exists for that email, a password reset link has been sent.',
    })
  } catch (error: unknown) {
    console.error('[Forgot Password] Failed to request a password reset email', error)

    return data<TForgotPasswordActionResponse>(
      {
        success: false,
        message: 'We could not send the password reset email. Please try again later.',
      },
      { status: 500 },
    )
  }
}

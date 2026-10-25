import { data } from 'react-router'
import z from 'zod'
import { EMAIL_VERIFICATION_CALLBACK_PATH } from '~/features/auth/email-verification'
import { isEmailConfigured, withEmailLocale } from '~/features/email/index.server'
import { checkRateLimit, rateLimitHeaders } from '~/features/security/rate-limit.server'
import { auth } from '~/lib/auth'
import type { ActionArgs } from '~/lib/types'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'

export type TResendVerificationActionResponse = {
  success: boolean
  message: string
  errors?: { email?: string[] }
}

export async function resendVerificationEmailAction(args: ActionArgs) {
  const formData = await args.request.formData()
  const result = z
    .object({ email: z.email(m.verification_email_invalid()) })
    .safeParse({ email: formData.get('email') })

  if (!result.success) {
    return data<TResendVerificationActionResponse>(
      {
        success: false,
        message: m.verification_resend_invalid(),
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    )
  }

  const limit = await checkRateLimit(args.request, {
    max: 3,
    scope: 'resend-verification',
    subjects: [result.data.email],
    windowSeconds: 15 * 60,
  })
  if (!limit.allowed) {
    return data<TResendVerificationActionResponse>(
      { success: false, message: m.auth_rate_limit_exceeded() },
      { status: 429, headers: rateLimitHeaders(limit.retryAfterSeconds) },
    )
  }

  if (!isEmailConfigured()) {
    return data<TResendVerificationActionResponse>(
      { success: false, message: m.verification_resend_unavailable() },
      { status: 503 },
    )
  }

  try {
    await auth.api.sendVerificationEmail({
      body: {
        email: result.data.email,
        callbackURL: EMAIL_VERIFICATION_CALLBACK_PATH,
      },
      headers: withEmailLocale(args.request.headers, getLocale()),
    })

    // This is intentionally generic so the endpoint does not reveal whether an account exists.
    return data<TResendVerificationActionResponse>({
      success: true,
      message: m.verification_resend_success(),
    })
  } catch (error: unknown) {
    console.error('[Email Verification] Failed to resend verification email', error)
    return data<TResendVerificationActionResponse>(
      { success: false, message: m.verification_resend_error() },
      { status: 500 },
    )
  }
}

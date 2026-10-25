import { getAuthFeatureConfig } from '~/features/auth/config.server'
import { checkRateLimit } from '~/features/security/rate-limit.server'
import type { ActionArgs } from '~/lib/types'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import { createRegisterUserSchema } from '../schemas/form/user-schema'
import * as userService from '../services'
import {
  CaptchaVerificationError,
  EmailAlreadyExistsError,
  InvalidUserDataError,
} from '../types/errors/user-errors'

export type RegisterUserSuccess = {
  success: true
  email: string
  setCookie: string | null
}

export type RegisterUserFailure = {
  success: false
  error: string
  status: number
}

export type RegisterUserResult = RegisterUserSuccess | RegisterUserFailure

export async function registerUserAction(args: ActionArgs): Promise<RegisterUserResult> {
  const formData = await args.request.formData()
  const authFeatures = getAuthFeatureConfig()
  const captchaResponse = formData.get('captchaResponse')

  if (authFeatures.recaptcha.enabled && (typeof captchaResponse !== 'string' || !captchaResponse)) {
    return {
      success: false,
      error: m.auth_captcha_required(),
      status: 400,
    }
  }
  const registerUserSchema = createRegisterUserSchema({
    nameRequired: m.register_validation_name_required(),
    nameMax: m.register_validation_name_max(),
    emailInvalid: m.register_validation_email(),
    passwordMin: m.register_validation_password_min(),
    passwordMax: m.register_validation_password_max(),
  })
  const parsed = registerUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    const messages = Object.values(parsed.error.flatten().fieldErrors).flat()
    return {
      success: false,
      error: messages[0] ?? m.register_error_check_input(),
      status: 400,
    }
  }

  const limit = await checkRateLimit(args.request, {
    max: 5,
    scope: 'register',
    subjects: [parsed.data.email],
    windowSeconds: 15 * 60,
  })
  if (!limit.allowed) {
    return {
      success: false,
      error: m.auth_rate_limit_exceeded(),
      status: 429,
    }
  }

  try {
    const result = await userService.register(
      parsed.data,
      typeof captchaResponse === 'string' ? captchaResponse : undefined,
      getLocale(),
    )
    return {
      success: true,
      email: parsed.data.email,
      setCookie: result.setCookie,
    }
  } catch (error: unknown) {
    const status =
      error instanceof CaptchaVerificationError
        ? 403
        : error instanceof EmailAlreadyExistsError
          ? 409
          : error instanceof InvalidUserDataError
            ? 400
            : typeof error === 'object' && error !== null && 'status' in error
              ? Number(error.status)
              : 500
    const message =
      status === 403
        ? m.auth_captcha_failed()
        : status === 409
          ? m.register_error_email_exists()
          : status === 400
            ? m.register_error_invalid_data()
            : m.register_error_failed()
    return {
      success: false,
      error: message,
      status: Number.isFinite(status) ? status : 500,
    }
  }
}

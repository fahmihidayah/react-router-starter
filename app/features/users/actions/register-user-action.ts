import type { ActionArgs } from '~/lib/types'
import { registerUserSchema } from '../schemas/form/user-schema'
import * as userService from '../services'
import { EmailAlreadyExistsError, InvalidUserDataError } from '../types/errors/user-errors'

export type RegisterUserSuccess = {
  success: true
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
  const parsed = registerUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    const messages = Object.values(parsed.error.flatten().fieldErrors).flat()
    return {
      success: false,
      error: messages[0] ?? 'Please check your input',
      status: 400,
    }
  }

  try {
    const result = await userService.register(parsed.data)
    return {
      success: true,
      setCookie: result.setCookie,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    const status =
      error instanceof EmailAlreadyExistsError
        ? 409
        : error instanceof InvalidUserDataError
          ? 400
          : typeof error === 'object' && error !== null && 'status' in error
            ? Number(error.status)
            : 500
    return {
      success: false,
      error: message,
      status: Number.isFinite(status) ? status : 500,
    }
  }
}

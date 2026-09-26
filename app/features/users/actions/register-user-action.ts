import type { ActionArgs } from '~/lib/types'
import * as userService from '../services'
import { registerUserSchema } from '../schemas/form/user-schema'

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
    const result = await userService.create(parsed.data)
    return {
      success: true,
      setCookie: result.setCookie,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Registration failed',
      status: error.status || 500,
    }
  }
}

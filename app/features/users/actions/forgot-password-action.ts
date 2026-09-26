import { data } from 'react-router'
import type { ActionArgs } from '~/lib/types'
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

  return data<TForgotPasswordActionResponse>(
    {
      success: false,
      message: 'Password reset email is not configured yet. Contact an administrator for help.',
    },
    { status: 503 },
  )
}

import { redirect } from 'react-router'
import type { ActionArgs } from '~/lib/types'
import { updateUserSchema } from '../schemas/form/user-schema'
import * as userService from '../services'
import { EmailAlreadyExistsError, UserNotFoundError } from '../types/errors/user-errors'

export async function updateUserAction(args: ActionArgs) {
  const id = args.params.id
  if (!id) {
    throw new Response('User ID is required', { status: 400 })
  }

  const formData = await args.request.formData()
  const result = updateUserSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    await userService.update(id, result.data)
    return redirect('/admin/users')
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      throw new Response(error.message, { status: 404 })
    }

    if (error instanceof EmailAlreadyExistsError) {
      return {
        errors: {
          name: [],
          email: [error.message],
        },
      }
    }

    return {
      errors: {
        name: ['An unexpected error occurred. Please try again.'],
        email: [],
      },
    }
  }
}

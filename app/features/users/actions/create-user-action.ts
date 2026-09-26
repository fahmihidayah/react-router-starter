import { redirect } from 'react-router'
import {
  type ActionArgs,
  type ApiResponse,
  createErrorResponse,
  createSuccessResponse,
} from '~/lib/types'
import { createUserSchema } from '../schemas/form/user-schema'
import * as userService from '../services'
import {
  EmailAlreadyExistsError,
  InvalidUserDataError,
  UserCreationFailedError,
} from '../types/errors/user-errors'

export async function createUserAction(
  args: ActionArgs,
): Promise<ApiResponse<{ userId: string; setCookie: string | null }>> {
  const formData = await args.request.formData()
  const result = createUserSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return createErrorResponse(result.error.flatten().fieldErrors, 400)
  }

  try {
    const createResult = await userService.create(result.data)
    return createSuccessResponse(createResult)
  } catch (error) {
    if (error instanceof EmailAlreadyExistsError) {
      return createErrorResponse(
        {
          name: [],
          email: [error.message],
          password: [],
        },
        409,
      )
    }

    if (error instanceof InvalidUserDataError) {
      return createErrorResponse(
        {
          name: [error.message],
          email: [],
          password: [],
        },
        400,
      )
    }

    if (error instanceof UserCreationFailedError) {
      return createErrorResponse(
        {
          name: [error.message],
          email: [],
          password: [],
        },
        500,
      )
    }

    return createErrorResponse(
      {
        name: ['An unexpected error occurred. Please try again.'],
        email: [],
        password: [],
      },
      500,
    )
  }
}

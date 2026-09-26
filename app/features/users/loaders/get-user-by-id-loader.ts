import {
  type ApiResponse,
  createErrorResponse,
  createSuccessResponse,
  type LoaderArgs,
} from '~/lib/types'
import * as userService from '../services'
import type { UserWithRoles } from '../types'

export async function getUserByIdLoader(args: LoaderArgs): Promise<ApiResponse<UserWithRoles>> {
  const id = args.params.id
  if (!id) {
    return createErrorResponse('User not found', 404)
  }

  const user = await userService.findById(id)

  if (!user) {
    return createErrorResponse('User not found', 404)
  }

  return createSuccessResponse(user)
}

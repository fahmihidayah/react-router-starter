import { type ApiResponse, createSuccessResponse, type LoaderArgs } from '~/lib/types'
import type { PaginateDocs } from '~/types/pagination'
import * as userService from '../services'
import type { UserWithRoles } from '../types'

export async function getUsersLoader(
  args: LoaderArgs,
): Promise<ApiResponse<PaginateDocs<UserWithRoles> | undefined>> {
  const url = new URL(args.request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10)
  const search = url.searchParams.get('search') || ''

  return createSuccessResponse(
    await userService.findPaginated({
      page,
      limit,
      name: search || undefined,
    }),
  )
}

import { like } from 'drizzle-orm/sql'
import { users } from '~/db/schema'
import type { PaginateDocs } from '~/types/pagination'
import type { TUser } from '~/db/schema'
import { userRepository } from '../repositories'

export async function getUsersLoader(
  request: Request,
): Promise<PaginateDocs<TUser>> {
  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10)
  const search = url.searchParams.get('search') || ''

  return await userRepository.findManyPaginated({
    where: search ? like(user.name, `%${search}%`) : undefined,
    page,
    limit,
  })
}

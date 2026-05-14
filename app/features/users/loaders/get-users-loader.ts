import { like } from 'drizzle-orm/sql'
import { user } from '~/db/schema'
import { userRepository } from '../user-repository'

export async function getUsersLoader(request: Request) {
  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const pageSize = Number.parseInt(url.searchParams.get('pageSize') || '10', 10)
  const search = url.searchParams.get('search') || ''

  const result = await userRepository.findManyPaginated({
    where: search ? like(user.name, `%${search}%`) : undefined,
    page,
    pageSize,
  })

  return {
    users: result.data,
    totalCount: result.pagination.totalItems,
    page: result.pagination.currentPage,
    pageSize: result.pagination.pageSize,
    totalPages: result.pagination.totalPages,
  }
}

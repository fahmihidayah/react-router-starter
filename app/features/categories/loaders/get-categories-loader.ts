import { like } from 'drizzle-orm/sql'
import { categories } from '~/db/schema'
import type { PaginateDocs } from '~/types/pagination'
import type { TCategory } from '~/db/schema'
import { categoryRepository } from '../repositories'

export async function getCategoriesLoader(
  request: Request,
): Promise<PaginateDocs<TCategory>> {
  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10)
  const search = url.searchParams.get('search') || ''

  return await categoryRepository.findManyPaginated({
    where: search ? like(categories.title, `%${search}%`) : undefined,
    page,
    limit,
  })
}

import { like } from 'drizzle-orm/sql'
import { congregations, type TCongregation } from '~/db/schema'
import type { PaginateDocs } from '~/types/pagination'
import { congregationRepository } from '../repositories'

export async function getCongregationsLoader(
  request: Request,
): Promise<PaginateDocs<TCongregation>> {
  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10)
  const search = url.searchParams.get('search') || ''

  return await congregationRepository.findManyPaginated({
    where: search ? like(congregations.name, `%${search}%`) : undefined,
    page,
    limit,
  })
}

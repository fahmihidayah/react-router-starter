import type { PaginateDocs } from '~/types/pagination'
import type { TQurban } from '~/db/schema'
import { qurbanRepository } from '../repositories'

export async function getQurbansLoader(
  request: Request,
): Promise<PaginateDocs<TQurban>> {
  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10)

  return await qurbanRepository.findManyPaginated({
    page,
    limit,
  })
}

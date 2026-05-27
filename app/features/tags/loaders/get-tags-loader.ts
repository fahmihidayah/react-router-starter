import { like } from 'drizzle-orm/sql'
import { tags } from '~/db/schema'
import type { PaginateDocs } from '~/types/pagination'
import type { TTag } from '~/db/schema'
import { tagRepository } from '../repositories'

export async function getTagsLoader(
  request: Request,
): Promise<PaginateDocs<TTag>> {
  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10)
  const search = url.searchParams.get('search') || ''

  return await tagRepository.findManyPaginated({
    where: search ? like(tags.name, `%${search}%`) : undefined,
    page,
    limit,
  })
}

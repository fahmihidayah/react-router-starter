import { like } from 'drizzle-orm'
import { media } from '~/db/schema'
import type { PaginateDocs } from '~/types/pagination'
import type { TMedia } from '../type'
import { mediaRepository } from '../repositories'

export async function getMediaLoader(request: Request): Promise<PaginateDocs<TMedia>> {
  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10)
  const search = url.searchParams.get('search') || ''

  return await mediaRepository.findManyPaginated({
    where: search ? like(media.filename, `%${search}%`) : undefined,
    page,
    limit,
  })
}

import type { PaginateDocs } from '~/types/pagination'
import type { TMedia } from '../schemas/db/media'
import * as mediaService from '../services'

export async function getMediaLoader(request: Request): Promise<PaginateDocs<TMedia>> {
  const url = new URL(request.url)
  const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1)
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(url.searchParams.get('limit') || '20', 10) || 20),
  )

  return mediaService.findPaginated({
    page,
    limit,
    search: url.searchParams.get('search')?.trim() || undefined,
  })
}

import { like } from 'drizzle-orm/sql'
import { events } from '~/db/schema'
import type { PaginateDocs } from '~/types/pagination'
import type { TEvent } from '~/db/schema'
import { eventRepository } from '../repositories'

export async function getEventsLoader(
  request: Request,
): Promise<PaginateDocs<TEvent>> {
  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10)
  const search = url.searchParams.get('search') || ''

  return await eventRepository.findManyPaginated({
    where: search ? like(event.name, `%${search}%`) : undefined,
    page,
    limit,
  })
}

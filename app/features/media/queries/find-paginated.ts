import { and, ilike, type SQL, sql } from 'drizzle-orm'
import { media, type TMedia } from '~/db/schema'
import { db } from '~/lib/database'
import type { PaginateDocs } from '~/types/pagination'

export type FindPaginatedParams = {
  page?: number
  limit?: number
  search?: string
}

export async function findPaginated({
  page = 1,
  limit = 20,
  search,
}: FindPaginatedParams): Promise<PaginateDocs<TMedia>> {
  const conditions: SQL[] = []
  if (search) conditions.push(ilike(media.filename, `%${search}%`))
  const where = conditions.length > 0 ? and(...conditions) : undefined
  const offset = (page - 1) * limit

  const [docs, [{ count }]] = await Promise.all([
    db.query.media.findMany({
      where: where ? { RAW: where } : undefined,
      orderBy: { createdAt: 'desc' },
      limit,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(media)
      .where(where ?? sql`1=1`),
  ])

  const totalDocs = Number(count)
  const totalPages = Math.ceil(totalDocs / limit)
  return {
    docs,
    page,
    limit,
    totalDocs,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

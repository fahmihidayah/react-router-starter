import { and, like, type SQL, sql } from 'drizzle-orm'
import type { TCategory } from '~/db/schema'
import { categories } from '~/db/schema'
import { db } from '~/lib/database'
import type { PaginateDocs } from '~/types/pagination'

type SortField = 'createdAt' | 'title' | 'updatedAt'
type SortDir = 'asc' | 'desc'

export type FindPaginatedParams = {
  sortBy?: SortField
  sortDir?: SortDir
  page?: number
  limit?: number
  // Filter fields
  title?: string
}

// Whitelist sort columns to prevent SQL injection
export async function findPaginated(params: FindPaginatedParams): Promise<PaginateDocs<TCategory>> {
  const { sortBy = 'createdAt', sortDir = 'desc', page = 1, limit = 20, title } = params

  // Build dynamic WHERE conditions
  const conditions: SQL[] = []
  if (title) conditions.push(like(categories.title, `%${title}%`))

  const where = conditions.length ? and(...conditions) : undefined
  const offset = (page - 1) * limit

  // Parallel execution for performance
  const [rows, [{ count }]] = await Promise.all([
    db.query.categories.findMany({
      where: where ? { RAW: where } : undefined,
      orderBy: { [sortBy]: sortDir },
      limit,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(where ?? sql`1=1`),
  ])

  const totalDocs = Number(count)
  const totalPages = Math.ceil(totalDocs / limit)

  return {
    docs: rows,
    page,
    limit,
    totalDocs,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

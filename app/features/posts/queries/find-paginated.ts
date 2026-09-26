import { and, eq, like, type SQL, sql } from 'drizzle-orm'
import { posts } from '~/db/schema'
import type { TPost } from '~/features/posts/schemas/db/posts'
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
  categoryId?: string
  search?: string
}

export async function findPaginated(params: FindPaginatedParams): Promise<PaginateDocs<TPost>> {
  const {
    sortBy = 'createdAt',
    sortDir = 'desc',
    page = 1,
    limit = 10,
    categoryId,
    search,
  } = params

  const conditions: SQL[] = []

  // Apply filters
  if (categoryId) conditions.push(eq(posts.categoryId, categoryId))
  if (search) conditions.push(like(posts.title, `%${search}%`))

  const where = conditions.length ? and(...conditions) : undefined
  const offset = (page - 1) * limit

  const [rows, [{ count }]] = await Promise.all([
    db.query.posts.findMany({
      where: where ? { RAW: where } : undefined,
      orderBy: { [sortBy]: sortDir },
      limit,
      offset,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
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

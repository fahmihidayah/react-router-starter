import { and, eq, gte, like, lte, type SQL, sql } from 'drizzle-orm'
import { roles } from '~/db/schema'
import { db } from '~/lib/database'
import type { PaginateDocs } from '~/types/pagination'
import type { RoleWithPermissions } from '../types'
import { toRoleWithPermissions } from './utils'

type SortField = 'createdAt' | 'name' | 'updatedAt'
type SortDir = 'asc' | 'desc'

export type FindPaginatedParams = {
  sortBy?: SortField
  sortDir?: SortDir
  page?: number
  limit?: number
  // Filter fields
  id?: string
  name?: string
  description?: string
  createdAtFrom?: Date
  createdAtTo?: Date
  updatedAtFrom?: Date
  updatedAtTo?: Date
}

// Whitelist sort columns to prevent SQL injection
export async function findPaginated(
  params: FindPaginatedParams,
): Promise<PaginateDocs<RoleWithPermissions>> {
  const {
    sortBy = 'createdAt',
    sortDir = 'desc',
    page = 1,
    limit = 20,
    id,
    name,
    description,
    createdAtFrom,
    createdAtTo,
    updatedAtFrom,
    updatedAtTo,
  } = params

  // Build dynamic WHERE conditions
  const conditions: SQL[] = []
  if (id) conditions.push(eq(roles.id, id))
  if (name) conditions.push(like(roles.name, `%${name}%`))
  if (description) conditions.push(like(roles.description, `%${description}%`))
  if (createdAtFrom) conditions.push(gte(roles.createdAt, createdAtFrom))
  if (createdAtTo) conditions.push(lte(roles.createdAt, createdAtTo))
  if (updatedAtFrom) conditions.push(gte(roles.updatedAt, updatedAtFrom))
  if (updatedAtTo) conditions.push(lte(roles.updatedAt, updatedAtTo))

  const where = conditions.length ? and(...conditions) : undefined
  const offset = (page - 1) * limit

  // Parallel execution for performance
  const [rows, [{ count }]] = await Promise.all([
    db.query.roles.findMany({
      where: where ? { RAW: where } : undefined,
      orderBy: { [sortBy]: sortDir },
      limit,
      offset,
      with: { rolePermissions: { with: { permission: true } } },
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(roles)
      .where(where ?? sql`1=1`),
  ])

  const totalDocs = Number(count)
  const totalPages = Math.ceil(totalDocs / limit)

  return {
    docs: rows.map(toRoleWithPermissions),
    page,
    limit,
    totalDocs,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

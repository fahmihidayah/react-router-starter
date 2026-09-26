import { and, eq, gte, like, lte, type SQL, sql } from 'drizzle-orm'
import { users } from '~/db/schema'
import { db } from '~/lib/database'
import type { PaginateDocs } from '~/types/pagination'
import type { UserWithRoles } from '../types'
import { toUserWithRoles } from './utils'

type SortField = 'createdAt' | 'name' | 'email' | 'updatedAt' | 'emailVerified'
type SortDir = 'asc' | 'desc'

export type FindPaginatedParams = {
  sortBy?: SortField
  sortDir?: SortDir
  page?: number
  limit?: number
  // Filter fields
  id?: string
  name?: string
  email?: string
  emailVerified?: boolean
  image?: string
  createdAtFrom?: Date
  createdAtTo?: Date
  updatedAtFrom?: Date
  updatedAtTo?: Date
}
export async function findPaginated(
  params: FindPaginatedParams,
): Promise<PaginateDocs<UserWithRoles>> {
  const {
    sortBy = 'createdAt',
    sortDir = 'desc',
    page = 1,
    limit = 20,
    id,
    name,
    email,
    emailVerified,
    image,
    createdAtFrom,
    createdAtTo,
    updatedAtFrom,
    updatedAtTo,
  } = params

  const conditions: SQL[] = []

  // Apply filters for all user fields
  if (id) conditions.push(eq(users.id, id))
  if (name) conditions.push(like(users.name, `%${name}%`))
  if (email) conditions.push(like(users.email, `%${email}%`))
  if (emailVerified !== undefined) conditions.push(eq(users.emailVerified, emailVerified))
  if (image) conditions.push(like(users.image, `%${image}%`))
  if (createdAtFrom) conditions.push(gte(users.createdAt, createdAtFrom))
  if (createdAtTo) conditions.push(lte(users.createdAt, createdAtTo))
  if (updatedAtFrom) conditions.push(gte(users.updatedAt, updatedAtFrom))
  if (updatedAtTo) conditions.push(lte(users.updatedAt, updatedAtTo))

  const where = conditions.length ? and(...conditions) : undefined
  const offset = (page - 1) * limit

  const [rows, [{ count }]] = await Promise.all([
    db.query.users.findMany({
      where: where ? { RAW: where } : undefined,
      orderBy: { [sortBy]: sortDir },
      limit,
      offset,
      with: { userRoles: { with: { role: true } } },
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(where ?? sql`1=1`),
  ])

  const totalDocs = Number(count)
  const totalPages = Math.ceil(totalDocs / limit)

  return {
    docs: rows.map(toUserWithRoles),
    page,
    limit,
    totalDocs,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

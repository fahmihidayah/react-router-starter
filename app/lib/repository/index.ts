// repositories/BaseRepository.ts
import { and, eq, type SQL, sql } from 'drizzle-orm'
import type { SQLiteTableWithColumns, SQLiteColumn } from 'drizzle-orm/sqlite-core'
import { db } from '../database'
import type { PaginateDocs } from '~/types/pagination'

type AnyTable = SQLiteTableWithColumns<any>

type InferInsertModel<T extends AnyTable> = T['$inferInsert']
type InferSelectModel<T extends AnyTable> = T['$inferSelect']

// Constraint for tables with an id column
type TableWithId = AnyTable & {
  id: SQLiteColumn<any>
}

type WhereCondition = SQL<unknown> | SQL<unknown>[]

export class BaseRepository<TTable extends TableWithId> {
  constructor(protected table: TTable) {}

  // CREATE
  async create(data: InferInsertModel<TTable>): Promise<InferSelectModel<TTable>> {
    const [result] = await db
      .insert(this.table)
      .values(data)
      .returning()
    return result as InferSelectModel<TTable>
  }

  async createMany(data: InferInsertModel<TTable>[]): Promise<InferSelectModel<TTable>[]> {
    return (await db
      .insert(this.table)
      .values(data)
      .returning()) as InferSelectModel<TTable>[]
  }

  async findById(id: number | string): Promise<InferSelectModel<TTable> | undefined> {
    const [result] = await db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1)
    return result as InferSelectModel<TTable> | undefined
  }

  async findOne(where: WhereCondition): Promise<InferSelectModel<TTable> | undefined> {
    const condition = Array.isArray(where) ? and(...where) : where
    const [result] = await db
      .select()
      .from(this.table)
      .where(condition)
      .limit(1)
    return result as InferSelectModel<TTable> | undefined
  }

  async findMany(where?: WhereCondition): Promise<InferSelectModel<TTable>[]> {
    const query = db.select().from(this.table)

    if (where) {
      const condition = Array.isArray(where) ? and(...where) : where
      return (await query.where(condition)) as InferSelectModel<TTable>[]
    }

    return (await query) as InferSelectModel<TTable>[]
  }

  async findManyPaginated(
    options: { where?: WhereCondition; page?: number; limit?: number } = {},
  ): Promise<PaginateDocs<InferSelectModel<TTable>>> {
    const { where, page = 1, limit = 10 } = options
    return this.findPaginated(page, limit, where)
  }

  async findAll(): Promise<InferSelectModel<TTable>[]> {
    return (await db.select().from(this.table)) as InferSelectModel<TTable>[]
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginateDocs<InferSelectModel<TTable>>> {
    return this.findPaginated(page, limit)
  }

  async findPaginated(
    page: number = 1,
    limit: number = 10,
    where?: WhereCondition,
  ): Promise<PaginateDocs<InferSelectModel<TTable>>> {
    const currentPage = Math.max(1, page)
    const offset = (currentPage - 1) * limit

    const query = db.select().from(this.table)
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(this.table)

    if (where) {
      const condition = Array.isArray(where) ? and(...where) : where
      query.where(condition)
      countQuery.where(condition)
    }

    const [data, [{ count }]] = await Promise.all([
      query.limit(limit).offset(offset),
      countQuery,
    ])

    const totalDocs = Number(count)
    const totalPages = Math.ceil(totalDocs / limit)
    const hasNextPage = currentPage < totalPages
    const hasPrevPage = currentPage > 1

    return {
      docs: data as InferSelectModel<TTable>[],
      page: currentPage,
      limit,
      totalDocs,
      totalPages,
      hasNextPage,
      hasPrevPage,
    }
  }

  // UPDATE
  async update(
    id: number | string,
    data: Partial<InferInsertModel<TTable>>,
  ): Promise<InferSelectModel<TTable> | undefined> {
    
    const result = await db
      .update(this.table)
      .set(data)
      .where(eq(this.table.id, id))
      .returning()
    return result as InferSelectModel<TTable> | undefined
  }

  async updateMany(
    where: WhereCondition,
    data: Partial<InferInsertModel<TTable>>,
  ): Promise<InferSelectModel<TTable>[]> {
    const condition = Array.isArray(where) ? and(...where) : where
    return (await db
      .update(this.table)
      .set(data)
      .where(condition)
      .returning()) as InferSelectModel<TTable>[]
  }

  // DELETE
  async delete(id: number | string): Promise<InferSelectModel<TTable> | undefined> {
    // biome-ignore lint/suspicious/noExplicitAny: Required for Drizzle ORM generic type compatibility
    const [result] = await db
      .delete(this.table)
      .where(eq(this.table.id, id as any))
      .returning()
    return result as InferSelectModel<TTable> | undefined
  }

  async deleteMany(where: WhereCondition): Promise<InferSelectModel<TTable>[]> {
    const condition = Array.isArray(where) ? and(...where) : where
    return (await db.delete(this.table).where(condition).returning()) as InferSelectModel<TTable>[]
  }

  // Utility
  async exists(where: WhereCondition): Promise<boolean> {
    const result = await this.findOne(where)
    return !!result
  }

  async count(where?: WhereCondition): Promise<number> {
    const query = db.select({ count: sql<number>`count(*)` }).from(this.table)

    if (where) {
      const condition = Array.isArray(where) ? and(...where) : where
      query.where(condition)
    }

    const [{ count }] = await query
    return Number(count)
  }
}

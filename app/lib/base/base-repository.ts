// repositories/BaseRepository.ts
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { and, eq, sql, type SQL } from 'drizzle-orm/sql';
import { db } from '../database';

type InferInsertModel<T extends SQLiteTable> = T['$inferInsert'];
type InferSelectModel<T extends SQLiteTable> = T['$inferSelect'];

type WhereCondition = SQL<unknown> | SQL<unknown>[];

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

export class BaseRepository<TTable extends SQLiteTable & {
    id : any
}> {
  constructor(protected table: TTable) {}

  // CREATE
  async create(data: InferInsertModel<TTable>): Promise<InferSelectModel<TTable>> {
    const [result] = await db.insert(this.table).values(data).returning();
    return result;
  }

  async createMany(data: InferInsertModel<TTable>[]): Promise<InferSelectModel<TTable>[]> {
    return await db.insert(this.table).values(data).returning();
  }

  // READ
  async findById(id: number | string): Promise<InferSelectModel<TTable> | undefined> {
    const [result] = await db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);
    return result;
  }

  async findOne(where: WhereCondition): Promise<InferSelectModel<TTable> | undefined> {
    const condition = Array.isArray(where) ? and(...where) : where;
    const [result] = await db
      .select()
      .from(this.table)
      .where(condition)
      .limit(1);
    return result;
  }

  async findMany(where?: WhereCondition): Promise<InferSelectModel<TTable>[]> {
    const query = db.select().from(this.table);

    if (where) {
      const condition = Array.isArray(where) ? and(...where) : where;
      return await query.where(condition);
    }

    return await query;
  }

  // findMany with pagination support
  async findManyPaginated(
    options: {
      where?: WhereCondition;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<PaginationResult<InferSelectModel<TTable>>> {
    const { where, page = 1, pageSize = 10 } = options;
    return this.findPaginated(page, pageSize, where);
  }

  async findAll(): Promise<InferSelectModel<TTable>[]> {
    return await db.select().from(this.table);
  }

  // findAll with pagination support
  async findAllPaginated(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginationResult<InferSelectModel<TTable>>> {
    return this.findPaginated(page, pageSize);
  }

  // Paginated read with enhanced pagination info
  async findPaginated(
    page: number = 1,
    pageSize: number = 10,
    where?: WhereCondition
  ): Promise<PaginationResult<InferSelectModel<TTable>>> {
    // Ensure page is at least 1
    const currentPage = Math.max(1, page);
    const offset = (currentPage - 1) * pageSize;

    const query = db.select().from(this.table);
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(this.table);

    if (where) {
      const condition = Array.isArray(where) ? and(...where) : where;
      query.where(condition);
      countQuery.where(condition);
    }

    const [data, [{ count }]] = await Promise.all([
      query.limit(pageSize).offset(offset),
      countQuery
    ]);

    const totalItems = Number(count);
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return {
      data,
      pagination: {
        currentPage,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? currentPage + 1 : null,
        prevPage: hasPrevPage ? currentPage - 1 : null,
      }
    };
  }

  // UPDATE
  async update(
    id: number | string,
    data: Partial<InferInsertModel<TTable>>
  ): Promise<InferSelectModel<TTable> | undefined> {
    const [result] = await db
      .update(this.table)
      .set(data)
      .where(eq(this.table.id, id))
      .returning();
    return result;
  }

  async updateMany(
    where: WhereCondition,
    data: Partial<InferInsertModel<TTable>>
  ): Promise<InferSelectModel<TTable>[]> {
    const condition = Array.isArray(where) ? and(...where) : where;
    return await db
      .update(this.table)
      .set(data)
      .where(condition)
      .returning();
  }

  // DELETE
  async delete(id: number | string): Promise<InferSelectModel<TTable> | undefined> {
    const [result] = await db
      .delete(this.table)
      .where(eq(this.table.id, id))
      .returning();
    return result;
  }

  async deleteMany(where: WhereCondition): Promise<InferSelectModel<TTable>[]> {
    const condition = Array.isArray(where) ? and(...where) : where;
    return await db
      .delete(this.table)
      .where(condition)
      .returning();
  }

  // Utility
  async exists(where: WhereCondition): Promise<boolean> {
    const result = await this.findOne(where);
    return !!result;
  }

  async count(where?: WhereCondition): Promise<number> {
    const query = db.select({ count: sql<number>`count(*)` }).from(this.table);
    
    if (where) {
      const condition = Array.isArray(where) ? and(...where) : where;
      query.where(condition);
    }
    
    const [{ count }] = await query;
    return Number(count);
  }
}
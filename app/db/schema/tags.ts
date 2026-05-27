import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Tags table
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name', { length: 50 }).notNull().unique(),
  color: text('color', { length: 7 }),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})

export type TTag = typeof tags.$inferSelect
export type TInsertTag = typeof tags.$inferInsert

import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { categories } from './categories'

export const posts = sqliteTable('post', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  categoryId: text('categoryId')
    .notNull()
    .references(() => categories.id, {
      onDelete: 'cascade',
    }),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})

export type TPost = typeof posts.$inferSelect
export type TInsertPost = typeof posts.$inferInsert

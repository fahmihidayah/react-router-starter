import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { categories } from '../../../categories/schemas/db/categories'

export const posts = pgTable('post', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  categoryId: text('categoryId')
    .notNull()
    .references(() => categories.id, {
      onDelete: 'cascade',
    }),

  createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
})

export type TPost = typeof posts.$inferSelect
export type TInsertPost = typeof posts.$inferInsert

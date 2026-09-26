import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
})

export type TCategory = typeof categories.$inferSelect
export type TInsertCategory = typeof categories.$inferInsert

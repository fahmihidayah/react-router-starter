import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

// Tags table
export const tags = pgTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
})

export type TTag = typeof tags.$inferSelect
export type TInsertTag = typeof tags.$inferInsert

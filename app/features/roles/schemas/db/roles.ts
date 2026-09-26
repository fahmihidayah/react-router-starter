import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
})

export type TRole = typeof roles.$inferSelect
export type TInsertRole = typeof roles.$inferInsert

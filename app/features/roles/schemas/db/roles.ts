import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  name: text('name').notNull().unique(),
  description: text('description'),
  isSystem: boolean('isSystem').notNull().default(false),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
})

export type TRole = typeof roles.$inferSelect
export type TInsertRole = typeof roles.$inferInsert

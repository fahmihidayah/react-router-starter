import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const learners = pgTable('learners', {
  id: text('id').primaryKey(),
  avatar: text('avatar'),
  name: text('name').notNull(),
  dateOfBirth: timestamp('dateOfBirth', { withTimezone: true }),

  createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
})

export type TLearner = typeof learners.$inferSelect
export type TInsertLearner = typeof learners.$inferInsert

import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Events table
export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  name: text('name', { length: 200 }).notNull(),
  description: text('description'),
  eventDate: int('eventDate', { mode: 'timestamp' }).notNull(),
  location: text('location', { length: 200 }),
  status: text('status', { enum: ['planned', 'ongoing', 'completed', 'cancelled'] }).notNull(),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})

export type TEvent = typeof events.$inferSelect
export type TInsertEvent = typeof events.$inferInsert 

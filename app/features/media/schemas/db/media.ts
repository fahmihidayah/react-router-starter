import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const media = pgTable('media', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  alt: text('alt'),
  filename: text('filename').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
})

export type TMedia = typeof media.$inferSelect
export type TInsertMedia = typeof media.$inferInsert

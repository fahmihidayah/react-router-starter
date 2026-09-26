import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const media = pgTable('media', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  alt: text('alt'),
  filename: text('filename').notNull(),
  originalFilename: text('originalFilename'),
  storageProvider: text('storageProvider').$type<'local' | 's3'>(),
  storageKey: text('storageKey'),
  mimeType: text('mimeType'),
  size: integer('size'),
  width: integer('width'),
  height: integer('height'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
})

export type TMedia = typeof media.$inferSelect
export type TInsertMedia = typeof media.$inferInsert

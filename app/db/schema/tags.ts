import { relations } from 'drizzle-orm'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { congregationTags } from './congregation-tags'

// Tags table
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name', { length: 50 }).notNull().unique(),
  color: text('color', { length: 7 }),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})

export const tagsRelations = relations(tags, ({ many }) => ({
  congregationTags: many(congregationTags),
}))

export type TTag = typeof tags.$inferSelect
export type TInsertTag = typeof tags.$inferInsert

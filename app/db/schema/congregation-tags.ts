import { relations } from 'drizzle-orm'
import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { congregations } from './congregations'
import { tags } from './tags'

// Congregation Tags junction table (many-to-many)
export const congregationTags = sqliteTable(
  'congregation_tags',
  {
    congregationId: text('congregationId')
      .notNull()
      .references(() => congregations.id, {
        onDelete: 'cascade',
      }),
    tagId: text('tagId')
      .notNull()
      .references(() => tags.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.congregationId, table.tagId] }),
  }),
)

export const congregationTagsRelations = relations(congregationTags, ({ one }) => ({
  congregation: one(congregations, {
    fields: [congregationTags.congregationId],
    references: [congregations.id],
  }),
  tag: one(tags, {
    fields: [congregationTags.tagId],
    references: [tags.id],
  }),
}))

export type TCongregationTag = typeof congregationTags.$inferSelect
export type TInsertCongregationTag = typeof congregationTags.$inferInsert

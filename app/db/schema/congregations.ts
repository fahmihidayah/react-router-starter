import { relations } from 'drizzle-orm'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { congregationTags } from './congregation-tags'

export const congregations = sqliteTable('congregations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  gender: text('gender', { enum: ['f', 'm'] }).notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})

export const congregationsRelations = relations(congregations, ({ many }) => ({
  congregationTags: many(congregationTags)
}))

export type TCongregation = typeof congregations.$inferSelect
export type TInsertCongregation = typeof congregations.$inferInsert

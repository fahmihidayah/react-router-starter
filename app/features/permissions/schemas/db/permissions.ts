import { pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const permissions = pgTable(
  'permissions',
  {
    id: text('id').primaryKey(),
    resource: text('resource').notNull(),
    action: text('action').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  },
  (table) => [uniqueIndex('permissions_resource_action_idx').on(table.resource, table.action)],
)

export type TPermission = typeof permissions.$inferSelect
export type TInsertPermission = typeof permissions.$inferInsert

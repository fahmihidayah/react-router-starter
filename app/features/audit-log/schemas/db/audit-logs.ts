import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from '~/features/users/schemas/db/users'

export const auditLogs = pgTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    actorId: text('actor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  },
  (table) => [
    index('audit_log_actor_id_idx').on(table.actorId),
    index('audit_log_entity_idx').on(table.entityType, table.entityId),
    index('audit_log_created_at_idx').on(table.createdAt),
  ],
)

export type TAuditLog = typeof auditLogs.$inferSelect
export type TInsertAuditLog = typeof auditLogs.$inferInsert

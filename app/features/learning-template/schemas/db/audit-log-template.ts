import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { auditLogs } from '~/features/audit-log/schemas/db/audit-logs'
import { goalGroups } from '~/features/goals/schemas/db/goal-groups'
import { learners } from '~/features/learners/schemas/db/learners'
import { learningTemplates } from './learning-templates'

export const auditLogTemplates = pgTable('audit_log_template', {
  auditLogId: text('audit_log_id')
    .primaryKey()
    .references(() => auditLogs.id, { onDelete: 'cascade' }),
  templateId: text('template_id')
    .notNull()
    .references(() => learningTemplates.id, { onDelete: 'restrict' }),
  learnerId: text('learner_id').references(() => learners.id, { onDelete: 'set null' }),
  goalGroupId: text('goal_group_id').references(() => goalGroups.id, { onDelete: 'set null' }),
  createdGoalIds: jsonb('created_goal_ids').$type<string[]>().notNull(),
  appliedStartDate: timestamp('applied_start_date', { withTimezone: true }).notNull(),
})

export type TAuditLogTemplate = typeof auditLogTemplates.$inferSelect
export type TInsertAuditLogTemplate = typeof auditLogTemplates.$inferInsert

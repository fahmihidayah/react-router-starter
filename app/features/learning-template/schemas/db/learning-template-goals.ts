import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { learningTemplates } from './learning-templates'

export const learningTemplateGoals = pgTable(
  'learning_template_goals',
  {
    id: text('id').primaryKey(),
    templateId: text('templateId')
      .notNull()
      .references(() => learningTemplates.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    targetValue: integer('targetValue').notNull().default(1),
    unit: text('unit').notNull().default('times'),
    durationDays: integer('durationDays').notNull().default(1),
    position: integer('position').notNull().default(0),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  },
  (table) => [index('learning_template_goals_template_id_idx').on(table.templateId)],
)

export type TLearningTemplateGoal = typeof learningTemplateGoals.$inferSelect
export type TInsertLearningTemplateGoal = typeof learningTemplateGoals.$inferInsert

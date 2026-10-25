import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { learners } from '~/features/learners/schemas/db/learners'
import { learningTemplates } from '~/features/learning-template/schemas/db/learning-templates'
import { users } from '~/features/users/schemas/db/users'

export const goalGroups = pgTable(
  'goal_groups',
  {
    id: text('id').primaryKey(),
    learnerId: text('learnerId')
      .notNull()
      .references(() => learners.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    position: integer('position').notNull().default(0),
    sourceTemplateId: text('sourceTemplateId').references(() => learningTemplates.id, {
      onDelete: 'set null',
    }),
    sourceTemplateTitle: text('sourceTemplateTitle'),
    createdByUserId: text('createdByUserId')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  },
  (table) => [
    index('goal_groups_learner_id_idx').on(table.learnerId),
    index('goal_groups_source_template_id_idx').on(table.sourceTemplateId),
  ],
)

export type TGoalGroup = typeof goalGroups.$inferSelect
export type TInsertGoalGroup = typeof goalGroups.$inferInsert

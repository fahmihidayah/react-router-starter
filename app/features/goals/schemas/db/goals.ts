import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { learners } from '~/features/learners/schemas/db/learners'
import { goalGroups } from './goal-groups'

export const goals = pgTable(
  'learner_goals',
  {
    id: text('id').primaryKey(),
    learnerId: text('learnerId')
      .notNull()
      .references(() => learners.id, { onDelete: 'cascade' }),
    groupId: text('groupId').references(() => goalGroups.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    targetValue: integer('targetValue').notNull().default(1),
    unit: text('unit').notNull().default('times'),
    startDate: timestamp('startDate', { withTimezone: true }).notNull(),
    endDate: timestamp('endDate', { withTimezone: true }).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  },
  (table) => [
    index('learner_goals_learner_id_idx').on(table.learnerId),
    index('learner_goals_group_id_idx').on(table.groupId),
  ],
)

export type TGoal = typeof goals.$inferSelect
export type TInsertGoal = typeof goals.$inferInsert

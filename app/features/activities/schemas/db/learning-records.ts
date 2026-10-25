import { sql } from 'drizzle-orm'
import { check, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { goals } from '~/features/goals/schemas/db/goals'
import { learners } from '~/features/learners/schemas/db/learners'
import { scheduleTodos } from '~/features/schedules/schemas/db/schedule-todos'
import { users } from '~/features/users/schemas/db/users'
import { activityTracks } from './activity-tracks'

export const learningRecords = pgTable(
  'learning_records',
  {
    id: text('id').primaryKey(),
    learnerId: text('learnerId')
      .notNull()
      .references(() => learners.id, { onDelete: 'cascade' }),
    goalId: text('goalId').references(() => goals.id, { onDelete: 'set null' }),
    trackId: text('trackId').references(() => activityTracks.id, { onDelete: 'set null' }),
    scheduleTodoId: text('scheduleTodoId').references(() => scheduleTodos.id, {
      onDelete: 'set null',
    }),
    recordedByUserId: text('recordedByUserId')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    activityDate: timestamp('activityDate', { withTimezone: true }).notNull(),
    title: text('title').notNull(),
    durationMinutes: integer('durationMinutes'),
    value: integer('value'),
    unit: text('unit'),
    note: text('note'),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  },
  (table) => [
    check(
      'learning_records_measurement_pair_check',
      sql`(${table.value} IS NULL AND ${table.unit} IS NULL) OR (${table.value} IS NOT NULL AND ${table.unit} IS NOT NULL)`,
    ),
    check(
      'learning_records_positive_value_check',
      sql`${table.value} IS NULL OR ${table.value} > 0`,
    ),
    check(
      'learning_records_positive_duration_check',
      sql`${table.durationMinutes} IS NULL OR ${table.durationMinutes} > 0`,
    ),
    check(
      'learning_records_single_context_check',
      sql`NOT (${table.goalId} IS NOT NULL AND ${table.trackId} IS NOT NULL)`,
    ),
    index('learning_records_learner_date_idx').on(table.learnerId, table.activityDate),
    index('learning_records_goal_id_idx').on(table.goalId),
    index('learning_records_track_id_idx').on(table.trackId),
    index('learning_records_schedule_todo_id_idx').on(table.scheduleTodoId),
  ],
)

export type TLearningRecord = typeof learningRecords.$inferSelect
export type TInsertLearningRecord = typeof learningRecords.$inferInsert

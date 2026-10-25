import { sql } from 'drizzle-orm'
import { check, index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { activityTracks } from '~/features/activities/schemas/db/activity-tracks'
import { goals } from '~/features/goals/schemas/db/goals'
import { learners } from '~/features/learners/schemas/db/learners'
import { users } from '~/features/users/schemas/db/users'
import { dailySchedules } from './daily-schedules'
import { scheduleItems } from './schedule-items'

export const scheduleTodos = pgTable(
  'schedule_todos',
  {
    id: text('id').primaryKey(),
    scheduleId: text('scheduleId')
      .notNull()
      .references(() => dailySchedules.id, { onDelete: 'cascade' }),
    scheduleItemId: text('scheduleItemId').references(() => scheduleItems.id, {
      onDelete: 'set null',
    }),
    learnerId: text('learnerId')
      .notNull()
      .references(() => learners.id, { onDelete: 'cascade' }),
    scheduledDate: text('scheduledDate').notNull(),
    sourceType: text('sourceType', { enum: ['goal', 'activity_track'] }).notNull(),
    goalId: text('goalId').references(() => goals.id, { onDelete: 'set null' }),
    trackId: text('trackId').references(() => activityTracks.id, { onDelete: 'set null' }),
    titleSnapshot: text('titleSnapshot').notNull(),
    plannedDurationMinutes: integer('plannedDurationMinutes').notNull(),
    position: integer('position').notNull(),
    cancelledAt: timestamp('cancelledAt', { withTimezone: true }),
    cancellationReason: text('cancellationReason', {
      enum: ['removed', 'day_cleared', 'series_changed', 'source_archived'],
    }),
    createdByUserId: text('createdByUserId')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  },
  (table) => [
    check('schedule_todos_positive_duration_check', sql`${table.plannedDurationMinutes} > 0`),
    check('schedule_todos_position_check', sql`${table.position} >= 0`),
    check(
      'schedule_todos_single_source_check',
      sql`NOT (${table.goalId} IS NOT NULL AND ${table.trackId} IS NOT NULL)`,
    ),
    uniqueIndex('schedule_todos_item_date_unique').on(table.scheduleItemId, table.scheduledDate),
    uniqueIndex('schedule_todos_active_goal_date_unique')
      .on(table.learnerId, table.scheduledDate, table.goalId)
      .where(sql`${table.goalId} IS NOT NULL AND ${table.cancelledAt} IS NULL`),
    uniqueIndex('schedule_todos_active_track_date_unique')
      .on(table.learnerId, table.scheduledDate, table.trackId)
      .where(sql`${table.trackId} IS NOT NULL AND ${table.cancelledAt} IS NULL`),
    index('schedule_todos_learner_date_position_idx').on(
      table.learnerId,
      table.scheduledDate,
      table.position,
    ),
    index('schedule_todos_goal_id_idx').on(table.goalId),
    index('schedule_todos_track_id_idx').on(table.trackId),
  ],
)

export type TScheduleTodo = typeof scheduleTodos.$inferSelect
export type TInsertScheduleTodo = typeof scheduleTodos.$inferInsert

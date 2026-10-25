import { sql } from 'drizzle-orm'
import { check, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { activityTracks } from '~/features/activities/schemas/db/activity-tracks'
import { goals } from '~/features/goals/schemas/db/goals'
import { dailySchedules } from './daily-schedules'

export const scheduleItems = pgTable(
  'schedule_items',
  {
    id: text('id').primaryKey(),
    scheduleId: text('scheduleId')
      .notNull()
      .references(() => dailySchedules.id, { onDelete: 'cascade' }),
    sourceType: text('sourceType', { enum: ['goal', 'activity_track'] }).notNull(),
    goalId: text('goalId').references(() => goals.id, { onDelete: 'set null' }),
    trackId: text('trackId').references(() => activityTracks.id, { onDelete: 'set null' }),
    titleSnapshot: text('titleSnapshot').notNull(),
    plannedDurationMinutes: integer('plannedDurationMinutes').notNull(),
    position: integer('position').notNull(),
    archivedAt: timestamp('archivedAt', { withTimezone: true }),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  },
  (table) => [
    check('schedule_items_positive_duration_check', sql`${table.plannedDurationMinutes} > 0`),
    check('schedule_items_position_check', sql`${table.position} >= 0`),
    check(
      'schedule_items_single_source_check',
      sql`NOT (${table.goalId} IS NOT NULL AND ${table.trackId} IS NOT NULL)`,
    ),
    index('schedule_items_schedule_position_idx').on(table.scheduleId, table.position),
    index('schedule_items_goal_id_idx').on(table.goalId),
    index('schedule_items_track_id_idx').on(table.trackId),
  ],
)

export type TScheduleItem = typeof scheduleItems.$inferSelect
export type TInsertScheduleItem = typeof scheduleItems.$inferInsert

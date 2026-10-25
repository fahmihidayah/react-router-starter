import { index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { learners } from '~/features/learners/schemas/db/learners'
import { users } from '~/features/users/schemas/db/users'

export const dailySchedules = pgTable(
  'daily_schedules',
  {
    id: text('id').primaryKey(),
    learnerId: text('learnerId')
      .notNull()
      .references(() => learners.id, { onDelete: 'cascade' }),
    startsOn: text('startsOn').notNull(),
    timezone: text('timezone').notNull().default('Asia/Jakarta'),
    pausedAt: timestamp('pausedAt', { withTimezone: true }),
    createdByUserId: text('createdByUserId')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex('daily_schedules_learner_id_unique').on(table.learnerId),
    index('daily_schedules_creator_id_idx').on(table.createdByUserId),
  ],
)

export type TDailySchedule = typeof dailySchedules.$inferSelect
export type TInsertDailySchedule = typeof dailySchedules.$inferInsert

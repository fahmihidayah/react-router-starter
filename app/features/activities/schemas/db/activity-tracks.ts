import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { learners } from '~/features/learners/schemas/db/learners'

export const activityTracks = pgTable(
  'activity_tracks',
  {
    id: text('id').primaryKey(),
    learnerId: text('learnerId')
      .notNull()
      .references(() => learners.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    archivedAt: timestamp('archivedAt', { withTimezone: true }),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  },
  (table) => [index('activity_tracks_learner_id_idx').on(table.learnerId)],
)

export type TActivityTrack = typeof activityTracks.$inferSelect
export type TInsertActivityTrack = typeof activityTracks.$inferInsert

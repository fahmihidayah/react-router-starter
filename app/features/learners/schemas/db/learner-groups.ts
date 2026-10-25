import { index, integer, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from '~/features/users/schemas/db/users'

export const learnerGroups = pgTable(
  'learner_groups',
  {
    id: text('id').primaryKey(),
    ownerUserId: text('ownerUserId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    position: integer('position').notNull().default(0),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  },
  (table) => [
    unique('learner_groups_owner_name_unique').on(table.ownerUserId, table.name),
    index('learner_groups_owner_user_id_idx').on(table.ownerUserId),
  ],
)

export type TLearnerGroup = typeof learnerGroups.$inferSelect
export type TInsertLearnerGroup = typeof learnerGroups.$inferInsert

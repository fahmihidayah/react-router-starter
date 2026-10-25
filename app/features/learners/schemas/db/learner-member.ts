import { index, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from '~/features/users/schemas/db/users'
import { learnerGroups } from './learner-groups'
import { learners } from './learners'

export const learnerMembers = pgTable(
  'learner_members',
  {
    id: text('id').primaryKey(),
    learnerId: text('learnerId')
      .notNull()
      .references(() => learners.id, { onDelete: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    groupId: text('groupId').references(() => learnerGroups.id, { onDelete: 'set null' }),
    role: text('role', { enum: ['owner', 'parent', 'teacher', 'viewer'] }).notNull(),
    status: text('status', { enum: ['active', 'revoked'] })
      .notNull()
      .default('active'),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  },
  (t) => [
    unique().on(t.learnerId, t.userId),
    index('learner_members_user_id_idx').on(t.userId),
    index('learner_members_group_id_idx').on(t.groupId),
  ],
)

export type TLearnerMember = typeof learnerMembers.$inferSelect
export type TInsertLearnerMember = typeof learnerMembers.$inferInsert

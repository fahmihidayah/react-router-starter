import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from '~/features/users/schemas/db/users'

export const learningTemplates = pgTable(
  'learning_templates',
  {
    id: text('id').primaryKey(),
    ownerUserId: text('ownerUserId')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    title: text('title').notNull(),
    visibility: text('visibility', { enum: ['private', 'public'] })
      .notNull()
      .default('private'),
    archivedAt: timestamp('archivedAt', { withTimezone: true }),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  },
  (table) => [
    index('learning_templates_owner_user_id_idx').on(table.ownerUserId),
    index('learning_templates_visibility_idx').on(table.visibility),
  ],
)

export type TLearningTemplate = typeof learningTemplates.$inferSelect
export type TInsertLearningTemplate = typeof learningTemplates.$inferInsert

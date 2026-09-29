import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { roles } from '~/features/roles/schemas/db/roles'
import { users } from './users'

// A role can belong to many users, but each user has only one app role.
export const userRoles = pgTable(
  'user_roles',
  {
    userId: text('userId')
      .notNull()
      .unique()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),
    roleId: text('roleId')
      .notNull()
      .references(() => roles.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.roleId],
    }),
  ],
)

export type TUserRole = typeof userRoles.$inferSelect
export type TInsertUserRole = typeof userRoles.$inferInsert

import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { roles } from '~/features/roles/schemas/db/roles'
import { users } from './users'

// A role can belong to many users, while each user has exactly one app role assignment.

export const userRoles = pgTable(
  'user_roles',
  {
    userId: text('userId')
      .primaryKey()

      .references(() => users.id, {
        onDelete: 'cascade',
      }),
    roleId: text('roleId')
      .notNull()
      .references(() => roles.id, {
        onDelete: 'cascade',
      }),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('user_roles_role_id_idx').on(table.roleId)],
)

export type TUserRole = typeof userRoles.$inferSelect
export type TInsertUserRole = typeof userRoles.$inferInsert

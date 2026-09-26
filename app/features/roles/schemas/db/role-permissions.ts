import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { permissions } from '~/features/permissions/schemas/db/permissions'
import { roles } from './roles'

// Junction table for role <-> permission many-to-many relationship
export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: text('roleId')
      .notNull()
      .references(() => roles.id, {
        onDelete: 'cascade',
      }),
    permissionId: text('permissionId')
      .notNull()
      .references(() => permissions.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  }),
)

export type TRolePermission = typeof rolePermissions.$inferSelect
export type TInsertRolePermission = typeof rolePermissions.$inferInsert

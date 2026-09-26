import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

export const databaseRelations = defineRelations(schema, (r) => ({
  users: {
    userRoles: r.many.userRoles({ from: r.users.id, to: r.userRoles.userId }),
  },
  userRoles: {
    user: r.one.users({ from: r.userRoles.userId, to: r.users.id, optional: false }),
    role: r.one.roles({ from: r.userRoles.roleId, to: r.roles.id, optional: false }),
  },
  roles: {
    rolePermissions: r.many.rolePermissions({ from: r.roles.id, to: r.rolePermissions.roleId }),
    userRoles: r.many.userRoles({ from: r.roles.id, to: r.userRoles.roleId }),
  },
  rolePermissions: {
    role: r.one.roles({ from: r.rolePermissions.roleId, to: r.roles.id, optional: false }),
    permission: r.one.permissions({
      from: r.rolePermissions.permissionId,
      to: r.permissions.id,
      optional: false,
    }),
  },
  permissions: {
    rolePermissions: r.many.rolePermissions({
      from: r.permissions.id,
      to: r.rolePermissions.permissionId,
    }),
  },
  posts: {
    category: r.one.categories({ from: r.posts.categoryId, to: r.categories.id, optional: false }),
  },
  categories: {
    posts: r.many.posts({ from: r.categories.id, to: r.posts.categoryId }),
  },
}))

export const PERMISSION_KEYS = {
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  ROLES_READ: 'roles.read',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  ROLES_ASSIGN_PERMISSIONS: 'roles.assign-permissions',
  MEDIA_READ: 'media.read',
  MEDIA_CREATE: 'media.create',
  MEDIA_UPDATE: 'media.update',
  MEDIA_DELETE: 'media.delete',
  POSTS_READ: 'posts.read',
  POSTS_CREATE: 'posts.create',
  POSTS_UPDATE: 'posts.update',
  POSTS_DELETE: 'posts.delete',
  CATEGORIES_READ: 'categories.read',
  CATEGORIES_CREATE: 'categories.create',
  CATEGORIES_UPDATE: 'categories.update',
  CATEGORIES_DELETE: 'categories.delete',
  ACCOUNT_READ: 'account.read',
  ACCOUNT_UPDATE: 'account.update',
  ACCOUNT_DELETE: 'account.delete',
} as const

export type PermissionKey = (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS]

export type PermissionDefinition = {
  key: PermissionKey
  resource: string
  action: string
  name: string
  description: string
}

export const PERMISSION_REGISTRY = [
  permission(PERMISSION_KEYS.USERS_READ, 'users', 'read', 'Read users'),
  permission(PERMISSION_KEYS.USERS_CREATE, 'users', 'create', 'Create users'),
  permission(PERMISSION_KEYS.USERS_UPDATE, 'users', 'update', 'Update users'),
  permission(PERMISSION_KEYS.USERS_DELETE, 'users', 'delete', 'Delete users'),
  permission(PERMISSION_KEYS.ROLES_READ, 'roles', 'read', 'Read roles'),
  permission(PERMISSION_KEYS.ROLES_CREATE, 'roles', 'create', 'Create roles'),
  permission(PERMISSION_KEYS.ROLES_UPDATE, 'roles', 'update', 'Update roles'),
  permission(PERMISSION_KEYS.ROLES_DELETE, 'roles', 'delete', 'Delete roles'),
  permission(
    PERMISSION_KEYS.ROLES_ASSIGN_PERMISSIONS,
    'roles',
    'assign-permissions',
    'Assign role permissions',
  ),
  permission(PERMISSION_KEYS.MEDIA_READ, 'media', 'read', 'Read media'),
  permission(PERMISSION_KEYS.MEDIA_CREATE, 'media', 'create', 'Create media'),
  permission(PERMISSION_KEYS.MEDIA_UPDATE, 'media', 'update', 'Update media'),
  permission(PERMISSION_KEYS.MEDIA_DELETE, 'media', 'delete', 'Delete media'),
  permission(PERMISSION_KEYS.POSTS_READ, 'posts', 'read', 'Read posts'),
  permission(PERMISSION_KEYS.POSTS_CREATE, 'posts', 'create', 'Create posts'),
  permission(PERMISSION_KEYS.POSTS_UPDATE, 'posts', 'update', 'Update posts'),
  permission(PERMISSION_KEYS.POSTS_DELETE, 'posts', 'delete', 'Delete posts'),
  permission(PERMISSION_KEYS.CATEGORIES_READ, 'categories', 'read', 'Read categories'),
  permission(PERMISSION_KEYS.CATEGORIES_CREATE, 'categories', 'create', 'Create categories'),
  permission(PERMISSION_KEYS.CATEGORIES_UPDATE, 'categories', 'update', 'Update categories'),
  permission(PERMISSION_KEYS.CATEGORIES_DELETE, 'categories', 'delete', 'Delete categories'),
  permission(PERMISSION_KEYS.ACCOUNT_READ, 'account', 'read', 'Read own account'),
  permission(PERMISSION_KEYS.ACCOUNT_UPDATE, 'account', 'update', 'Update own account'),
  permission(PERMISSION_KEYS.ACCOUNT_DELETE, 'account', 'delete', 'Delete own account'),
] as const satisfies readonly PermissionDefinition[]

export const USER_PERMISSION_KEYS = [
  PERMISSION_KEYS.ACCOUNT_READ,
  PERMISSION_KEYS.ACCOUNT_UPDATE,
  PERMISSION_KEYS.ACCOUNT_DELETE,
] as const satisfies readonly PermissionKey[]

function permission(
  key: PermissionKey,
  resource: string,
  action: string,
  name: string,
): PermissionDefinition {
  return {
    key,
    resource,
    action,
    name,
    description: `Allows the role to ${action} ${resource.replaceAll('-', ' ')}`,
  }
}

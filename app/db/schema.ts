import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Better-auth tables
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: int('emailVerified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: int('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, {
      onDelete: 'cascade',
    }),
})

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, {
      onDelete: 'cascade',
    }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: int('accessTokenExpiresAt', { mode: 'timestamp' }),
  refreshTokenExpiresAt: int('refreshTokenExpiresAt', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: int('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: int('createdAt', { mode: 'timestamp' }),
  updatedAt: int('updatedAt', { mode: 'timestamp' }),
})

export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  alt: text('alt'),
  filename: text('filename').notNull(),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})

export const categories = sqliteTable('category', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})

export const posts = sqliteTable('post', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  categoryId: text('categoryId')
    .notNull()
    .references(() => categories.id, {
      onDelete: 'cascade',
    }),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})

export type TMedia = typeof media.$inferSelect
export type TCategory = typeof categories.$inferSelect
export type TPost = typeof posts.$inferSelect

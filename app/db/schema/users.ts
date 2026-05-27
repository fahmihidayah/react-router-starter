import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Better-auth tables
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: int('emailVerified', { mode: 'boolean' }).notNull(),
  image: text('image'),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: int('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: int('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: int('updatedAt', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),
})

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, {
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

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: int('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: int('createdAt', { mode: 'timestamp' }),
  updatedAt: int('updatedAt', { mode: 'timestamp' }),
})

export type TUser = typeof users.$inferSelect
export type TInsertUser = typeof users.$inferInsert
export type TSession = typeof sessions.$inferSelect
export type TInsertSession = typeof sessions.$inferInsert
export type TAccount = typeof accounts.$inferSelect
export type TInsertAccount = typeof accounts.$inferInsert
export type TVerification = typeof verifications.$inferSelect
export type TInsertVerification = typeof verifications.$inferInsert

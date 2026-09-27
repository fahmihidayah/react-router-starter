import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

// Better Auth tables

export const users = pgTable('users', {
  id: text('id').primaryKey(),

  name: text('name').notNull(),

  email: text('email').notNull().unique(),

  emailVerified: boolean('emailVerified').notNull(),

  image: text('image'),

  // Better Auth admin plugin fields
  role: text('role').default('user'),
  banned: boolean('banned').default(false),
  banReason: text('banReason'),
  banExpires: timestamp('banExpires', {
    withTimezone: true,
  }),

  createdAt: timestamp('createdAt', {
    withTimezone: true,
  }).notNull(),

  updatedAt: timestamp('updatedAt', {
    withTimezone: true,
  }).notNull(),
})

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),

  expiresAt: timestamp('expiresAt', {
    withTimezone: true,
  }).notNull(),

  token: text('token').notNull().unique(),

  createdAt: timestamp('createdAt', {
    withTimezone: true,
  }).notNull(),

  updatedAt: timestamp('updatedAt', {
    withTimezone: true,
  }).notNull(),

  ipAddress: text('ipAddress'),

  userAgent: text('userAgent'),

  impersonatedBy: text('impersonatedBy'),

  userId: text('userId')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),
})

export const accounts = pgTable('accounts', {
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

  accessTokenExpiresAt: timestamp('accessTokenExpiresAt', {
    withTimezone: true,
  }),

  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', {
    withTimezone: true,
  }),

  scope: text('scope'),

  password: text('password'),

  createdAt: timestamp('createdAt', {
    withTimezone: true,
  }).notNull(),

  updatedAt: timestamp('updatedAt', {
    withTimezone: true,
  }).notNull(),
})

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),

  identifier: text('identifier').notNull(),

  value: text('value').notNull(),

  expiresAt: timestamp('expiresAt', {
    withTimezone: true,
  }).notNull(),

  createdAt: timestamp('createdAt', {
    withTimezone: true,
  }),

  updatedAt: timestamp('updatedAt', {
    withTimezone: true,
  }),
})

// Types

export type TUser = Omit<typeof users.$inferSelect, 'role' | 'banned' | 'banReason' | 'banExpires'>
export type TInsertUser = typeof users.$inferInsert

export type TSession = typeof sessions.$inferSelect
export type TInsertSession = typeof sessions.$inferInsert

export type TAccount = typeof accounts.$inferSelect
export type TInsertAccount = typeof accounts.$inferInsert

export type TVerification = typeof verifications.$inferSelect
export type TInsertVerification = typeof verifications.$inferInsert

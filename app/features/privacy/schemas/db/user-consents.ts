import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from '~/features/users/schemas/db/users'

/**
 * User consent records for cookies, analytics, and other tracking.
 * Stores the current consent state for each user.
 */
export const userConsents = pgTable('user_consents', {
  id: text('id').primaryKey(),

  userId: text('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  // Consent types
  analyticsConsent: boolean('analytics_consent').notNull().default(false),
  marketingConsent: boolean('marketing_consent').notNull().default(false),
  functionalConsent: boolean('functional_consent').notNull().default(true), // Usually required

  // Metadata
  consentVersion: text('consent_version').notNull(), // Version of privacy policy accepted
  ipAddress: text('ip_address'), // IP when consent was given
  userAgent: text('user_agent'), // User agent when consent was given

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
})

/**
 * Audit trail for all consent changes.
 * Maintains a complete history of consent modifications for compliance.
 */
export const consentHistory = pgTable('consent_history', {
  id: text('id').primaryKey(),

  userId: text('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  // What changed
  consentType: text('consent_type').notNull(), // 'analytics', 'marketing', 'functional'
  consentValue: boolean('consent_value').notNull(), // true = granted, false = revoked
  consentVersion: text('consent_version').notNull(),

  // Context
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
})

// Types
export type TUserConsent = typeof userConsents.$inferSelect
export type TInsertUserConsent = typeof userConsents.$inferInsert

export type TConsentHistory = typeof consentHistory.$inferSelect
export type TInsertConsentHistory = typeof consentHistory.$inferInsert

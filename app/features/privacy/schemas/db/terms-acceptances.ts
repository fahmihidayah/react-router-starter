import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from '~/features/users/schemas/db/users'

/**
 * Records which version of Terms of Service and Privacy Policy
 * each user has accepted.
 */
export const termsAcceptances = pgTable('terms_acceptances', {
  id: text('id').primaryKey(),

  userId: text('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),

  // Version tracking
  termsVersion: text('terms_version').notNull(), // e.g., "1.0.0"
  privacyVersion: text('privacy_version').notNull(), // e.g., "1.0.0"

  // Context when accepted
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  acceptedAt: timestamp('accepted_at', {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  // Type of acceptance
  acceptanceType: text('acceptance_type').notNull(), // 'registration', 'update', 'forced'

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
})

// Types
export type TTermsAcceptance = typeof termsAcceptances.$inferSelect
export type TInsertTermsAcceptance = typeof termsAcceptances.$inferInsert

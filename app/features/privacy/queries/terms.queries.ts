import { desc, eq } from 'drizzle-orm'
import { termsAcceptances } from '~/db/schema'
import { db } from '~/lib/database'

export async function getLatestTermsAcceptance(userId: string) {
  const [acceptance] = await db
    .select()
    .from(termsAcceptances)
    .where(eq(termsAcceptances.userId, userId))
    .orderBy(desc(termsAcceptances.acceptedAt))
    .limit(1)

  return acceptance || null
}

export async function recordTermsAcceptance(data: {
  userId: string
  termsVersion: string
  privacyVersion: string
  acceptanceType: 'registration' | 'update' | 'forced'
  ipAddress?: string
  userAgent?: string
}) {
  const [acceptance] = await db
    .insert(termsAcceptances)
    .values({
      id: crypto.randomUUID(),
      userId: data.userId,
      termsVersion: data.termsVersion,
      privacyVersion: data.privacyVersion,
      acceptanceType: data.acceptanceType,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
    .returning()

  return acceptance
}

export async function getAllTermsAcceptances(userId: string) {
  return db
    .select()
    .from(termsAcceptances)
    .where(eq(termsAcceptances.userId, userId))
    .orderBy(desc(termsAcceptances.acceptedAt))
}

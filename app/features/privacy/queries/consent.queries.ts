import { desc, eq } from 'drizzle-orm'
import { consentHistory, userConsents } from '~/db/schema'
import { db } from '~/lib/database'

export async function getUserConsent(userId: string) {
  const [consent] = await db.select().from(userConsents).where(eq(userConsents.userId, userId))
  return consent || null
}

export async function upsertUserConsent(data: {
  userId: string
  analyticsConsent: boolean
  marketingConsent: boolean
  functionalConsent: boolean
  consentVersion: string
  ipAddress?: string
  userAgent?: string
}) {
  const existing = await getUserConsent(data.userId)

  if (existing) {
    // Update existing consent
    const [updated] = await db
      .update(userConsents)
      .set({
        analyticsConsent: data.analyticsConsent,
        marketingConsent: data.marketingConsent,
        functionalConsent: data.functionalConsent,
        consentVersion: data.consentVersion,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        updatedAt: new Date(),
      })
      .where(eq(userConsents.id, existing.id))
      .returning()

    return updated
  }

  // Create new consent record
  const [created] = await db
    .insert(userConsents)
    .values({
      id: crypto.randomUUID(),
      userId: data.userId,
      analyticsConsent: data.analyticsConsent,
      marketingConsent: data.marketingConsent,
      functionalConsent: data.functionalConsent,
      consentVersion: data.consentVersion,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
    .returning()

  return created
}

export async function recordConsentChange(data: {
  userId: string
  consentType: 'analytics' | 'marketing' | 'functional'
  consentValue: boolean
  consentVersion: string
  ipAddress?: string
  userAgent?: string
}) {
  await db.insert(consentHistory).values({
    id: crypto.randomUUID(),
    userId: data.userId,
    consentType: data.consentType,
    consentValue: data.consentValue,
    consentVersion: data.consentVersion,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  })
}

export async function getConsentHistory(userId: string, limit = 50) {
  return db
    .select()
    .from(consentHistory)
    .where(eq(consentHistory.userId, userId))
    .orderBy(desc(consentHistory.createdAt))
    .limit(limit)
}

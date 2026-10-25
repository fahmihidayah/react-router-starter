import {
  getConsentHistory,
  getUserConsent,
  recordConsentChange,
  upsertUserConsent,
} from '../queries/consent.queries'

const CURRENT_PRIVACY_VERSION = '1.0.0'

export async function updateUserConsentService(data: {
  userId: string
  analyticsConsent: boolean
  marketingConsent: boolean
  ipAddress?: string
  userAgent?: string
}) {
  // Get existing consent to detect changes
  const existing = await getUserConsent(data.userId)

  // Update consent
  const consent = await upsertUserConsent({
    userId: data.userId,
    analyticsConsent: data.analyticsConsent,
    marketingConsent: data.marketingConsent,
    functionalConsent: true, // Always true for essential cookies
    consentVersion: CURRENT_PRIVACY_VERSION,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  })

  // Record history for each changed consent type
  if (!existing || existing.analyticsConsent !== data.analyticsConsent) {
    await recordConsentChange({
      userId: data.userId,
      consentType: 'analytics',
      consentValue: data.analyticsConsent,
      consentVersion: CURRENT_PRIVACY_VERSION,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
  }

  if (!existing || existing.marketingConsent !== data.marketingConsent) {
    await recordConsentChange({
      userId: data.userId,
      consentType: 'marketing',
      consentValue: data.marketingConsent,
      consentVersion: CURRENT_PRIVACY_VERSION,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
  }

  return consent
}

export async function getUserConsentService(userId: string) {
  return getUserConsent(userId)
}

export async function getConsentHistoryService(userId: string) {
  return getConsentHistory(userId)
}

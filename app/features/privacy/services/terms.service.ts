import {
  getAllTermsAcceptances,
  getLatestTermsAcceptance,
  recordTermsAcceptance,
} from '../queries/terms.queries'

const CURRENT_TERMS_VERSION = '1.0.0'
const CURRENT_PRIVACY_VERSION = '1.0.0'

export async function recordTermsAcceptanceService(data: {
  userId: string
  acceptanceType: 'registration' | 'update' | 'forced'
  ipAddress?: string
  userAgent?: string
}) {
  return recordTermsAcceptance({
    userId: data.userId,
    termsVersion: CURRENT_TERMS_VERSION,
    privacyVersion: CURRENT_PRIVACY_VERSION,
    acceptanceType: data.acceptanceType,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  })
}

export async function checkTermsAcceptanceRequired(userId: string): Promise<boolean> {
  const latest = await getLatestTermsAcceptance(userId)

  if (!latest) {
    return true // No acceptance on record
  }

  // Check if version has changed
  return (
    latest.termsVersion !== CURRENT_TERMS_VERSION ||
    latest.privacyVersion !== CURRENT_PRIVACY_VERSION
  )
}

export async function getLatestTermsAcceptanceService(userId: string) {
  return getLatestTermsAcceptance(userId)
}

export async function getAllTermsAcceptancesService(userId: string) {
  return getAllTermsAcceptances(userId)
}

export { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION }

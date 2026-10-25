export const EMAIL_VERIFICATION_CALLBACK_PATH = '/verify-email?status=success'

export function getEmailVerificationPath(email?: string): string {
  if (!email) return '/verify-email'
  return `/verify-email?email=${encodeURIComponent(email)}`
}

export function isEmailNotVerifiedError(
  error: { code?: string; message?: string } | null | undefined,
): boolean {
  const code = error?.code?.toUpperCase()
  const message = error?.message?.toLowerCase()
  return (
    code === 'EMAIL_NOT_VERIFIED' ||
    Boolean(message?.includes('email') && message.includes('verified'))
  )
}

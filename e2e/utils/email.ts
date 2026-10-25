/**
 * Email testing utilities for E2E tests
 *
 * These utilities help test email-related functionality.
 * You could use:
 * 1. Test email API endpoint (admin/test only)
 * 2. MailHog or similar email testing service
 * 3. In-memory email storage during tests
 */

export interface EmailMessage {
  to: string
  from: string
  subject: string
  body: string
  html?: string
}

/**
 * Get all emails sent during test
 */
export async function getTestEmails(): Promise<EmailMessage[]> {
  // TODO: Implement email retrieval
  // This could call a test-only API endpoint
  console.log('Email retrieval not implemented yet')
  return []
}

/**
 * Get verification link from email
 */
export async function getVerificationLink(email: string): Promise<string | null> {
  const emails = await getTestEmails()
  const verificationEmail = emails.find(
    (e) => e.to === email && e.subject.toLowerCase().includes('verify'),
  )

  if (!verificationEmail) {
    return null
  }

  // Extract verification link from email body
  const linkMatch =
    verificationEmail.body.match(/href="([^"]*verify[^"]*)"/i) ||
    verificationEmail.html?.match(/href="([^"]*verify[^"]*)"/i)

  return linkMatch ? linkMatch[1] : null
}

/**
 * Get password reset link from email
 */
export async function getPasswordResetLink(email: string): Promise<string | null> {
  const emails = await getTestEmails()
  const resetEmail = emails.find(
    (e) =>
      e.to === email &&
      (e.subject.toLowerCase().includes('reset') || e.subject.toLowerCase().includes('password')),
  )

  if (!resetEmail) {
    return null
  }

  // Extract reset link from email body
  const linkMatch =
    resetEmail.body.match(/href="([^"]*reset[^"]*)"/i) ||
    resetEmail.html?.match(/href="([^"]*reset[^"]*)"/i)

  return linkMatch ? linkMatch[1] : null
}

/**
 * Clear all test emails
 */
export async function clearTestEmails(): Promise<void> {
  // TODO: Implement email clearing
  console.log('Email clearing not implemented yet')
}

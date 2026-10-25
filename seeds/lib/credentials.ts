export type BootstrapAdminCredentials = {
  email: string
  name: string
  password: string
}

export type BootstrapEnvironment = Record<string, string | undefined>

export const DEFAULT_ADMIN_NAME = 'Admin'

/**
 * Passwords that must never protect a bootstrap administrator. The first entry is the value that
 * shipped in this repository, so it stays rejected even if it is copied into a deployment.
 */
export const REJECTED_ADMIN_PASSWORDS = [
  'Test@1234',
  'admin',
  'administrator',
  'changeme',
  'changeme123',
  'changeme123!',
  'letmein',
  'password',
  'password123',
  'welcome123',
] as const

const MINIMUM_PASSWORD_LENGTH = 8
const MINIMUM_PRODUCTION_PASSWORD_LENGTH = 12

/** Raised when bootstrap credentials are missing, weak, or use a known default. */
export class BootstrapCredentialError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BootstrapCredentialError'
  }
}

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/**
 * Reads the administrator credentials used by `pnpm db:bootstrap-admin` from the environment.
 * The function never prints or logs its inputs and only reports which variable is invalid.
 */
export function resolveBootstrapAdminCredentials(
  environment: BootstrapEnvironment = process.env,
): BootstrapAdminCredentials {
  const isProduction = environment.NODE_ENV === 'production'
  const email = environment.ADMIN_EMAIL?.trim()
  const password = environment.ADMIN_PASSWORD
  const name = environment.ADMIN_NAME?.trim() || DEFAULT_ADMIN_NAME
  const setupHint =
    'Set ADMIN_EMAIL and ADMIN_PASSWORD for this command only, then run `pnpm db:bootstrap-admin`.'

  if (!email) throw new BootstrapCredentialError(`ADMIN_EMAIL is required. ${setupHint}`)
  if (!looksLikeEmail(email)) {
    throw new BootstrapCredentialError('ADMIN_EMAIL must be a valid email address.')
  }
  if (!password) throw new BootstrapCredentialError(`ADMIN_PASSWORD is required. ${setupHint}`)

  const normalizedPassword = password.trim().toLowerCase()
  const isRejectedDefault = REJECTED_ADMIN_PASSWORDS.some(
    (rejected) => rejected.toLowerCase() === normalizedPassword,
  )

  if (isRejectedDefault) {
    throw new BootstrapCredentialError(
      'ADMIN_PASSWORD uses a known default password. Choose a unique password for this deployment.',
    )
  }

  const minimumLength = isProduction ? MINIMUM_PRODUCTION_PASSWORD_LENGTH : MINIMUM_PASSWORD_LENGTH

  if (password.length < minimumLength) {
    throw new BootstrapCredentialError(
      `ADMIN_PASSWORD must be at least ${minimumLength} characters${isProduction ? ' in production' : ''}.`,
    )
  }

  const emailLocalPart = email.split('@')[0]?.toLowerCase() || ''

  if (isProduction && emailLocalPart && normalizedPassword.includes(emailLocalPart)) {
    throw new BootstrapCredentialError(
      'ADMIN_PASSWORD must not contain the administrator email local part in production.',
    )
  }

  return { email, name, password }
}

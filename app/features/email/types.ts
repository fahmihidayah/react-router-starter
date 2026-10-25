export const EMAIL_LOCALES = ['en', 'id'] as const

export type TEmailLocale = (typeof EMAIL_LOCALES)[number]

export type TEmailRecipient = {
  email: string
  locale?: TEmailLocale
  name?: string
}

export type TPasswordResetEmailData = TEmailRecipient & {
  resetUrl: string
  expiresInMinutes?: number
}

export type TAccountActivationEmailData = TEmailRecipient & {
  activationUrl: string
  expiresInMinutes?: number
}

export type TEmailVerificationData = TEmailRecipient & {
  verificationUrl?: string
  verificationCode?: string
  expiresInMinutes?: number
}

export type TEmailChangeConfirmationData = TEmailRecipient & {
  confirmationUrl: string
  expiresInMinutes?: number
  newEmail: string
}

export type TEmailChangeVerificationData = TEmailRecipient & {
  expiresInMinutes?: number
  verificationUrl: string
}

export type TRenderedEmail = {
  subject: string
  html: string
  text: string
}

export type TEmailDeliveryOptions = {
  traceId?: string
}

export class EmailDeliveryError extends Error {
  readonly traceId: string

  constructor(traceId: string, cause: unknown) {
    super('Email delivery failed', { cause })
    this.name = 'EmailDeliveryError'
    this.traceId = traceId
  }
}

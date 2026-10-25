export { isEmailConfigured, isTestEmailEndpointEnabled } from './config.server'
export {
  sendAccountActivationEmail,
  sendEmailChangeConfirmation,
  sendEmailChangeVerification,
  sendEmailVerification,
  sendPasswordResetEmail,
} from './email-service.server'
export { resolveEmailLocale, withEmailLocale } from './locale.server'
export type {
  TAccountActivationEmailData,
  TEmailChangeConfirmationData,
  TEmailChangeVerificationData,
  TEmailDeliveryOptions,
  TEmailLocale,
  TEmailVerificationData,
  TPasswordResetEmailData,
} from './types'
export { EmailDeliveryError } from './types'

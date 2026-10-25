import type { TRenderedEmail } from './types'

export const EMAIL_JOB_VERSION = 1

export type TEmailTemplate =
  | 'account-activation'
  | 'email-change-confirmation'
  | 'email-change-verification'
  | 'email-verification'
  | 'password-reset'

export type TEmailJob = {
  email: TRenderedEmail
  requestId?: string
  template: TEmailTemplate
  to: string
  traceId: string
  traceparent?: string
  version: typeof EMAIL_JOB_VERSION
}

export function isEmailJob(value: unknown): value is TEmailJob {
  if (!value || typeof value !== 'object') return false
  const job = value as Partial<TEmailJob>
  return (
    job.version === EMAIL_JOB_VERSION &&
    typeof job.to === 'string' &&
    typeof job.traceId === 'string' &&
    (job.requestId === undefined || typeof job.requestId === 'string') &&
    (job.traceparent === undefined || typeof job.traceparent === 'string') &&
    [
      'account-activation',
      'email-change-confirmation',
      'email-change-verification',
      'email-verification',
      'password-reset',
    ].includes(job.template || '') &&
    Boolean(job.email) &&
    typeof job.email?.subject === 'string' &&
    typeof job.email?.html === 'string' &&
    typeof job.email?.text === 'string'
  )
}

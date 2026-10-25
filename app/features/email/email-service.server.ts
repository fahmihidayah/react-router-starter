import {
  createServerLogger,
  formatTraceparent,
  getObservabilityContext,
  incrementEmailOperations,
} from '~/features/observability'
import { enqueue } from '~/features/queue/index.server'
import { getEmailDeliveryMode, getEmailQueueName } from './config.server'
import { deliverEmail, deliveryErrorLog, maskEmail } from './email-delivery.server'
import { EMAIL_JOB_VERSION, type TEmailTemplate } from './email-job'
import {
  renderAccountActivationEmail,
  renderEmailChangeConfirmation,
  renderEmailChangeVerification,
  renderEmailVerification,
  renderPasswordResetEmail,
} from './template-renderer.server'
import type {
  TAccountActivationEmailData,
  TEmailChangeConfirmationData,
  TEmailChangeVerificationData,
  TEmailDeliveryOptions,
  TEmailVerificationData,
  TPasswordResetEmailData,
  TRenderedEmail,
} from './types'
import { EmailDeliveryError } from './types'

const emailLogger = createServerLogger('Email')

async function sendRenderedEmail(
  to: string,
  email: TRenderedEmail,
  template: TEmailTemplate,
  options?: TEmailDeliveryOptions,
): Promise<string> {
  const traceId = options?.traceId || getObservabilityContext()?.traceId || crypto.randomUUID()

  try {
    if (getEmailDeliveryMode() === 'rabbitmq') {
      const messageId = await enqueue(
        getEmailQueueName(),
        {
          email,
          requestId: getObservabilityContext()?.requestId,
          template,
          to,
          traceId,
          traceparent: formatTraceparent(),
          version: EMAIL_JOB_VERSION,
        },
        { messageId: traceId, type: 'email.send' },
      )
      emailLogger.info('Email queued', { traceId, template, recipient: maskEmail(to), messageId })
      return messageId
    }

    return await deliverEmail(to, email, template, traceId)
  } catch (error) {
    incrementEmailOperations('send', 'failure', template, 'unconfigured')
    if (error instanceof EmailDeliveryError) throw error
    throw new EmailDeliveryError(traceId, error)
  }
}

async function renderAndSend(
  to: string,
  template: TEmailTemplate,
  render: () => TRenderedEmail,
  options?: TEmailDeliveryOptions,
): Promise<string> {
  const traceId = options?.traceId || getObservabilityContext()?.traceId || crypto.randomUUID()

  try {
    return await sendRenderedEmail(to, render(), template, { traceId })
  } catch (error) {
    if (error instanceof EmailDeliveryError) throw error

    emailLogger.error('Email preparation failed', {
      traceId,
      template,
      recipient: maskEmail(to),
      error: deliveryErrorLog(error),
    })
    throw new EmailDeliveryError(traceId, error)
  }
}

export async function sendPasswordResetEmail(
  data: TPasswordResetEmailData,
  options?: TEmailDeliveryOptions,
): Promise<string> {
  return renderAndSend(data.email, 'password-reset', () => renderPasswordResetEmail(data), options)
}

export async function sendAccountActivationEmail(
  data: TAccountActivationEmailData,
  options?: TEmailDeliveryOptions,
): Promise<string> {
  return renderAndSend(
    data.email,
    'account-activation',
    () => renderAccountActivationEmail(data),
    options,
  )
}

export async function sendEmailVerification(
  data: TEmailVerificationData,
  options?: TEmailDeliveryOptions,
): Promise<string> {
  return renderAndSend(
    data.email,
    'email-verification',
    () => renderEmailVerification(data),
    options,
  )
}

export async function sendEmailChangeConfirmation(
  data: TEmailChangeConfirmationData,
  options?: TEmailDeliveryOptions,
): Promise<string> {
  return renderAndSend(
    data.email,
    'email-change-confirmation',
    () => renderEmailChangeConfirmation(data),
    options,
  )
}

export async function sendEmailChangeVerification(
  data: TEmailChangeVerificationData,
  options?: TEmailDeliveryOptions,
): Promise<string> {
  return renderAndSend(
    data.email,
    'email-change-verification',
    () => renderEmailChangeVerification(data),
    options,
  )
}

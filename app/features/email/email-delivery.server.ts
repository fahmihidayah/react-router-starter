import nodemailer, { type Transporter } from 'nodemailer'
import { Resend } from 'resend'
import {
  createServerLogger,
  incrementEmailOperations,
  observeEmailDuration,
} from '~/features/observability'
import { getEmailConfig } from './config.server'
import type { TEmailTemplate } from './email-job'
import type { TRenderedEmail } from './types'

let transporter: Transporter | undefined
let resend: Resend | undefined
const emailLogger = createServerLogger('Email')

type TDeliveryError = Error & {
  address?: unknown
  code?: unknown
  command?: unknown
  hostname?: unknown
  port?: unknown
  response?: unknown
  responseCode?: unknown
  syscall?: unknown
}

export function maskEmail(value: string): string {
  const separator = value.lastIndexOf('@')
  if (separator < 1) return '***'
  const localPart = value.slice(0, separator)
  return `${localPart.slice(0, Math.min(2, localPart.length))}***@${value.slice(separator + 1)}`
}

function providerConfigLog(config: ReturnType<typeof getEmailConfig>) {
  if (config.provider === 'resend') {
    return { provider: 'resend', from: maskEmail(config.fromAddress) }
  }

  return {
    provider: 'smtp',
    host: config.smtp?.host,
    port: config.smtp?.port,
    secure: config.smtp?.secure,
    authentication: config.smtp?.user ? 'configured' : 'not-configured',
    from: maskEmail(config.fromAddress),
  }
}

export function deliveryErrorLog(error: unknown) {
  if (!(error instanceof Error)) return { message: String(error) }
  const deliveryError = error as TDeliveryError
  return {
    name: deliveryError.name,
    message: deliveryError.message,
    code: typeof deliveryError.code === 'string' ? deliveryError.code : undefined,
    command: typeof deliveryError.command === 'string' ? deliveryError.command : undefined,
    responseCode:
      typeof deliveryError.responseCode === 'number' ? deliveryError.responseCode : undefined,
    response:
      typeof deliveryError.response === 'string' ? deliveryError.response.slice(0, 500) : undefined,
    syscall: typeof deliveryError.syscall === 'string' ? deliveryError.syscall : undefined,
    hostname: typeof deliveryError.hostname === 'string' ? deliveryError.hostname : undefined,
    address: typeof deliveryError.address === 'string' ? deliveryError.address : undefined,
    port: typeof deliveryError.port === 'number' ? deliveryError.port : undefined,
    stack: deliveryError.stack,
  }
}

function recipientLog(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((recipient) => maskEmail(String(recipient)))
}

function getTransporter(config: ReturnType<typeof getEmailConfig>): Transporter {
  if (transporter) return transporter
  if (!config.smtp) throw new Error('SMTP configuration is missing')

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth:
      config.smtp.user && config.smtp.password
        ? { user: config.smtp.user, pass: config.smtp.password }
        : undefined,
  })
  emailLogger.info('SMTP transport initialized', { provider: providerConfigLog(config) })
  return transporter
}

async function deliverWithSmtp(
  config: ReturnType<typeof getEmailConfig>,
  to: string,
  email: TRenderedEmail,
) {
  const result = await getTransporter(config).sendMail({
    from: { name: config.fromName, address: config.fromAddress },
    to,
    replyTo: config.replyTo,
    subject: email.subject,
    html: email.html,
    text: email.text,
    disableFileAccess: true,
    disableUrlAccess: true,
  })
  return {
    messageId: result.messageId,
    accepted: recipientLog(result.accepted),
    rejected: recipientLog(result.rejected),
    pending: recipientLog(result.pending),
    response: typeof result.response === 'string' ? result.response.slice(0, 500) : undefined,
  }
}

async function deliverWithResend(
  config: ReturnType<typeof getEmailConfig>,
  to: string,
  email: TRenderedEmail,
) {
  if (!config.resendApiKey) throw new Error('Resend API key is missing')
  resend ||= new Resend(config.resendApiKey)

  const { data, error } = await resend.emails.send({
    from: `${config.fromName} <${config.fromAddress}>`,
    to,
    replyTo: config.replyTo,
    subject: email.subject,
    html: email.html,
    text: email.text,
  })
  if (error) throw new Error(error.message)
  if (!data?.id) throw new Error('Resend did not return an email ID')
  return { messageId: data.id }
}

export async function deliverEmail(
  to: string,
  email: TRenderedEmail,
  template: TEmailTemplate,
  traceId: string,
): Promise<string> {
  const startedAt = Date.now()
  let config: ReturnType<typeof getEmailConfig> | undefined

  try {
    config = getEmailConfig()
    emailLogger.info('Delivery started', {
      traceId,
      template,
      recipient: maskEmail(to),
      subject: email.subject,
      provider: providerConfigLog(config),
      content: {
        htmlBytes: Buffer.byteLength(email.html),
        textBytes: Buffer.byteLength(email.text),
      },
    })

    const result =
      config.provider === 'resend'
        ? await deliverWithResend(config, to, email)
        : await deliverWithSmtp(config, to, email)

    emailLogger.info('Delivery succeeded', {
      traceId,
      template,
      durationMs: Date.now() - startedAt,
      ...result,
    })
    incrementEmailOperations('deliver', 'success', template, config.provider)
    observeEmailDuration(config.provider, template, Date.now() - startedAt)
    return result.messageId
  } catch (error) {
    emailLogger.error('Delivery failed', {
      traceId,
      template,
      recipient: maskEmail(to),
      durationMs: Date.now() - startedAt,
      provider: config ? providerConfigLog(config) : { configurationLoaded: false },
      error: deliveryErrorLog(error),
    })
    incrementEmailOperations('deliver', 'failure', template, config?.provider ?? 'unconfigured')
    throw error
  }
}

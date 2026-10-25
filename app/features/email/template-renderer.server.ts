import Handlebars from 'handlebars'
import juice from 'juice'
import { compile } from 'tailwindcss'
import { getEmailConfig, type TEmailConfig } from './config.server'
import { getEmailCopy } from './email-copy'
import type { TEmailTemplate } from './email-job'
import { emailTailwindTheme } from './email-tailwind.server'
import actionTemplate from './templates/action.html?raw'
import layoutTemplate from './templates/layout.html?raw'
import type {
  TAccountActivationEmailData,
  TEmailChangeConfirmationData,
  TEmailChangeVerificationData,
  TEmailLocale,
  TEmailVerificationData,
  TPasswordResetEmailData,
  TRenderedEmail,
} from './types'

function getTailwindCandidates(templates: string[]): string[] {
  const candidates = templates.flatMap((template) =>
    Array.from(template.matchAll(/class="([^"]+)"/g)).flatMap((match) =>
      match[1].split(/\s+/).filter(Boolean),
    ),
  )

  return [...new Set(candidates)]
}

const tailwind = await compile(emailTailwindTheme)
const emailStyles = tailwind.build(getTailwindCandidates([layoutTemplate, actionTemplate]))

const layout = Handlebars.compile(layoutTemplate)
const action = Handlebars.compile(actionTemplate)

function recipientName(name: string | undefined, email: string): string {
  return name?.trim() || email.split('@')[0] || 'there'
}

const layoutCopy = {
  en: {
    contactSupport: 'Contact support',
    needHelp: 'Need help?',
    securityNotice: (appName: string, email: string) =>
      `This security email was sent by ${appName} to ${email}.`,
    tagline: 'Learn consistently. Grow confidently.',
  },
  id: {
    contactSupport: 'Hubungi dukungan',
    needHelp: 'Butuh bantuan?',
    securityNotice: (appName: string, email: string) =>
      `Email keamanan ini dikirim oleh ${appName} ke ${email}.`,
    tagline: 'Belajar konsisten. Tumbuh percaya diri.',
  },
} satisfies Record<TEmailLocale, object>

function renderLayout(
  config: TEmailConfig,
  locale: TEmailLocale,
  subject: string,
  preheader: string,
  email: string,
  content: string,
): string {
  const copy = layoutCopy[locale]

  const inlinedHtml = juice(
    layout({
      appName: config.appName,
      appUrl: config.appUrl,
      contactSupport: copy.contactSupport,
      content: new Handlebars.SafeString(content),
      currentYear: new Date().getFullYear(),
      email,
      locale,
      logoUrl: config.logoUrl,
      needHelp: copy.needHelp,
      preheader,
      securityNotice: copy.securityNotice(config.appName, email),
      subject,
      supportEmail: config.supportEmail,
      tagline: copy.tagline,
    }),
    {
      applyAttributesTableElements: true,
      applyHeightAttributes: false,
      applyWidthAttributes: false,
      extraCss: emailStyles,
      insertPreservedExtraCss: false,
      removeStyleTags: true,
      resolveCSSVariables: true,
    },
  )

  return inlinedHtml
    .replace(/calc\(4px \* (-?\d+)\)/g, (_match, multiplier: string) => {
      return `${Number(multiplier) * 4}px`
    })
    .replaceAll('var(--tw-border-style)', 'solid')
    .replace(/<style>\s*@layer properties;[\s\S]*?<\/style>/, '')
}

type TEmailRenderInput = {
  /** The link behind the button. Every email has one except a code-only verification. */
  actionUrl?: string
  email: string
  expiresInMinutes?: number
  locale?: TEmailLocale
  name?: string
  newEmail?: string
  verificationCode?: string
}

/**
 * Every email uses the same layout and the same content template. The wording for each email
 * and language lives in `email-copy.ts`, so this function only puts the pieces together.
 */
function renderEmail(template: TEmailTemplate, data: TEmailRenderInput): TRenderedEmail {
  const config = getEmailConfig()
  const locale = data.locale ?? 'en'
  const copy = getEmailCopy(template, locale, {
    actionUrl: data.actionUrl,
    appName: config.appName,
    email: data.email,
    expiresInMinutes: data.expiresInMinutes ?? 60,
    name: recipientName(data.name, data.email),
    newEmail: data.newEmail,
    verificationCode: data.verificationCode,
  })

  const html = renderLayout(
    config,
    locale,
    copy.subject,
    copy.preheader,
    data.email,
    action({
      ...copy,
      actionUrl: data.actionUrl,
      email: data.email,
      indigoNotice: template === 'password-reset',
      verificationCode: data.verificationCode,
    }),
  )

  const text = [
    copy.greeting,
    '',
    ...copy.textLines,
    '',
    copy.expiryNotice,
    copy.ignoreNotice,
  ].join('\n')

  return { subject: copy.subject, html, text }
}

export function renderPasswordResetEmail(data: TPasswordResetEmailData): TRenderedEmail {
  const { resetUrl, ...rest } = data
  return renderEmail('password-reset', { ...rest, actionUrl: resetUrl })
}

export function renderAccountActivationEmail(data: TAccountActivationEmailData): TRenderedEmail {
  const { activationUrl, ...rest } = data
  return renderEmail('account-activation', { ...rest, actionUrl: activationUrl })
}

export function renderEmailVerification(data: TEmailVerificationData): TRenderedEmail {
  if (!data.verificationUrl && !data.verificationCode) {
    throw new Error('Email verification requires a verificationUrl or verificationCode')
  }

  const { verificationUrl, ...rest } = data
  return renderEmail('email-verification', { ...rest, actionUrl: verificationUrl })
}

export function renderEmailChangeConfirmation(data: TEmailChangeConfirmationData): TRenderedEmail {
  const { confirmationUrl, ...rest } = data
  return renderEmail('email-change-confirmation', { ...rest, actionUrl: confirmationUrl })
}

export function renderEmailChangeVerification(data: TEmailChangeVerificationData): TRenderedEmail {
  const { verificationUrl, ...rest } = data
  return renderEmail('email-change-verification', { ...rest, actionUrl: verificationUrl })
}

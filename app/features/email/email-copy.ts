import type { TEmailTemplate } from './email-job'
import type { TEmailLocale } from './types'

export type TEmailCopyInput = {
  actionUrl?: string
  appName: string
  email: string
  expiresInMinutes: number
  name: string
  newEmail?: string
  verificationCode?: string
}

export type TEmailCopy = {
  buttonLabel: string
  codeLabel?: string
  expiryNotice: string
  fallbackInstructions: string
  greeting: string
  heading: string
  ignoreNotice: string
  introAfterEmail: string
  introBeforeEmail: string
  preheader: string
  subject: string
  /** Plain-text lines that go between the greeting and the expiry notice. */
  textLines: string[]
}

type TTemplateCopy = Omit<TEmailCopy, 'fallbackInstructions' | 'greeting' | 'textLines'> & {
  textLines: Array<string | undefined>
}

type TCopyBuilder = (input: TEmailCopyInput) => TTemplateCopy

/** Wording that is the same in every email. */
const commonCopy: Record<
  TEmailLocale,
  { fallbackInstructions: string; greeting: (name: string) => string }
> = {
  en: {
    fallbackInstructions:
      'If the button does not work, copy and paste this link into your browser:',
    greeting: (name) => `Hi ${name},`,
  },
  id: {
    fallbackInstructions:
      'Jika tombol tidak berfungsi, salin dan tempel tautan ini ke browser Anda:',
    greeting: (name) => `Halo ${name},`,
  },
}

/**
 * The wording of every email in every supported language. To add a language, add its code to
 * `EMAIL_LOCALES`, then a builder for each template here. To add an email, add its name to
 * `TEmailTemplate`, then a builder for each language here.
 */
const copyBuilders: Record<TEmailTemplate, Record<TEmailLocale, TCopyBuilder>> = {
  'password-reset': {
    en: ({ actionUrl, appName, email, expiresInMinutes }) => ({
      buttonLabel: 'Reset password',
      expiryNotice: `This link expires in ${expiresInMinutes} minutes and can only be used once.`,
      heading: 'Reset your password',
      ignoreNotice: 'If you did not request a password reset, you can safely ignore this email.',
      introAfterEmail: '. Use the button below to choose a new password.',
      introBeforeEmail: 'We received a request to reset the password for',
      preheader: `Reset the password for ${email}`,
      subject: `Reset your ${appName} password`,
      textLines: [
        `We received a request to reset the ${appName} password for ${email}.`,
        `Reset your password: ${actionUrl}`,
      ],
    }),
    id: ({ actionUrl, appName, email, expiresInMinutes }) => ({
      buttonLabel: 'Atur ulang kata sandi',
      expiryNotice: `Tautan ini akan kedaluwarsa dalam ${expiresInMinutes} menit dan hanya dapat digunakan satu kali.`,
      heading: 'Atur ulang kata sandi Anda',
      ignoreNotice:
        'Jika Anda tidak meminta pengaturan ulang kata sandi, Anda dapat mengabaikan email ini.',
      introAfterEmail: '. Gunakan tombol di bawah untuk memilih kata sandi baru.',
      introBeforeEmail: 'Kami menerima permintaan untuk mengatur ulang kata sandi untuk',
      preheader: `Atur ulang kata sandi untuk ${email}`,
      subject: `Atur ulang kata sandi ${appName} Anda`,
      textLines: [
        `Kami menerima permintaan untuk mengatur ulang kata sandi ${appName} untuk ${email}.`,
        `Atur ulang kata sandi Anda: ${actionUrl}`,
      ],
    }),
  },

  'account-activation': {
    en: ({ actionUrl, appName, email, expiresInMinutes }) => ({
      buttonLabel: 'Activate account',
      expiryNotice: `This activation link expires in ${expiresInMinutes} minutes and can only be used for this email address.`,
      heading: 'Activate your account',
      ignoreNotice: 'If you did not register this account, you can safely ignore this email.',
      introAfterEmail:
        '. Activate it to confirm your email address and finish setting up your account.',
      introBeforeEmail: `Welcome to ${appName}. Your account was registered with`,
      preheader: `Activate the ${appName} account registered for ${email}`,
      subject: `Activate your ${appName} account`,
      textLines: [
        `Welcome to ${appName}. Your account was registered with ${email}.`,
        `Activate your account: ${actionUrl}`,
      ],
    }),
    id: ({ actionUrl, appName, email, expiresInMinutes }) => ({
      buttonLabel: 'Aktifkan akun',
      expiryNotice: `Tautan aktivasi ini akan kedaluwarsa dalam ${expiresInMinutes} menit dan hanya dapat digunakan untuk alamat email ini.`,
      heading: 'Aktifkan akun Anda',
      ignoreNotice: 'Jika Anda tidak mendaftarkan akun ini, Anda dapat mengabaikan email ini.',
      introAfterEmail:
        '. Aktifkan akun untuk mengonfirmasi alamat email dan menyelesaikan pengaturan akun Anda.',
      introBeforeEmail: `Selamat datang di ${appName}. Akun Anda terdaftar dengan`,
      preheader: `Aktifkan akun ${appName} yang terdaftar untuk ${email}`,
      subject: `Aktifkan akun ${appName} Anda`,
      textLines: [
        `Selamat datang di ${appName}. Akun Anda terdaftar dengan ${email}.`,
        `Aktifkan akun Anda: ${actionUrl}`,
      ],
    }),
  },

  'email-verification': {
    en: ({ actionUrl, appName, email, expiresInMinutes, verificationCode }) => ({
      buttonLabel: 'Verify email address',
      codeLabel: 'Verification code',
      expiryNotice: `This verification expires in ${expiresInMinutes} minutes.`,
      heading: 'Verify your email',
      ignoreNotice: 'If you did not create this account, you can safely ignore this email.',
      introAfterEmail: ' belongs to you to finish setting up your account.',
      introBeforeEmail: 'Confirm that',
      preheader: `Verify ${email} to finish setting up your account`,
      subject: `Verify your email for ${appName}`,
      textLines: [
        `Confirm that ${email} belongs to you to finish setting up your ${appName} account.`,
        verificationCode ? `Verification code: ${verificationCode}` : undefined,
        actionUrl ? `Verify your email: ${actionUrl}` : undefined,
      ],
    }),
    id: ({ actionUrl, appName, email, expiresInMinutes, verificationCode }) => ({
      buttonLabel: 'Verifikasi alamat email',
      codeLabel: 'Kode verifikasi',
      expiryNotice: `Verifikasi ini akan kedaluwarsa dalam ${expiresInMinutes} menit.`,
      heading: 'Verifikasi email Anda',
      ignoreNotice: 'Jika Anda tidak membuat akun ini, Anda dapat mengabaikan email ini.',
      introAfterEmail: ' adalah milik Anda untuk menyelesaikan pengaturan akun.',
      introBeforeEmail: 'Konfirmasikan bahwa',
      preheader: `Verifikasi ${email} untuk menyelesaikan pengaturan akun Anda`,
      subject: `Verifikasi email Anda untuk ${appName}`,
      textLines: [
        `Konfirmasikan bahwa ${email} adalah milik Anda untuk menyelesaikan pengaturan akun ${appName}.`,
        verificationCode ? `Kode verifikasi: ${verificationCode}` : undefined,
        actionUrl ? `Verifikasi email Anda: ${actionUrl}` : undefined,
      ],
    }),
  },

  'email-change-confirmation': {
    en: ({ actionUrl, appName, email, expiresInMinutes, newEmail }) => ({
      buttonLabel: 'Confirm email change',
      expiryNotice: `This link expires in ${expiresInMinutes} minutes.`,
      heading: 'Confirm your email address change',
      ignoreNotice:
        'If you did not request this change, ignore this email and change your password immediately.',
      introAfterEmail: ` to ${newEmail}. Confirm this request before we send verification to the new address.`,
      introBeforeEmail: 'A request was made to change the sign-in email from',
      preheader: `Confirm the email change for your ${appName} account`,
      subject: `Confirm your ${appName} email change`,
      textLines: [`Confirm the email change from ${email} to ${newEmail}: ${actionUrl}`],
    }),
    id: ({ actionUrl, appName, email, expiresInMinutes, newEmail }) => ({
      buttonLabel: 'Konfirmasi perubahan email',
      expiryNotice: `Tautan ini akan kedaluwarsa dalam ${expiresInMinutes} menit.`,
      heading: 'Konfirmasi perubahan alamat email',
      ignoreNotice:
        'Jika Anda tidak meminta perubahan ini, abaikan email ini dan segera ubah kata sandi Anda.',
      introAfterEmail: ` menjadi ${newEmail}. Konfirmasikan permintaan ini sebelum kami mengirim verifikasi ke alamat baru.`,
      introBeforeEmail: 'Ada permintaan untuk mengubah alamat email masuk dari',
      preheader: `Konfirmasi perubahan email akun ${appName} Anda`,
      subject: `Konfirmasi perubahan email ${appName}`,
      textLines: [`Konfirmasikan perubahan email dari ${email} menjadi ${newEmail}: ${actionUrl}`],
    }),
  },

  'email-change-verification': {
    en: ({ actionUrl, appName, email, expiresInMinutes }) => ({
      buttonLabel: 'Verify new email',
      expiryNotice: `This link expires in ${expiresInMinutes} minutes.`,
      heading: 'Verify your new email address',
      ignoreNotice: 'If you did not request this change, do not verify this email address.',
      introAfterEmail: ` will become the new sign-in address for your ${appName} account.`,
      introBeforeEmail: 'Confirm that',
      preheader: `Verify the new email address for ${appName}`,
      subject: `Verify your new email for ${appName}`,
      textLines: [`Verify ${email} as your new sign-in address: ${actionUrl}`],
    }),
    id: ({ actionUrl, appName, email, expiresInMinutes }) => ({
      buttonLabel: 'Verifikasi email baru',
      expiryNotice: `Tautan ini akan kedaluwarsa dalam ${expiresInMinutes} menit.`,
      heading: 'Verifikasi alamat email baru Anda',
      ignoreNotice: 'Jika Anda tidak meminta perubahan ini, jangan verifikasi alamat email ini.',
      introAfterEmail: ` akan menjadi alamat masuk baru untuk akun ${appName} Anda.`,
      introBeforeEmail: 'Konfirmasikan bahwa',
      preheader: `Verifikasi alamat email baru untuk ${appName}`,
      subject: `Verifikasi email baru Anda untuk ${appName}`,
      textLines: [`Verifikasi ${email} sebagai alamat masuk baru Anda: ${actionUrl}`],
    }),
  },
}

export function getEmailCopy(
  template: TEmailTemplate,
  locale: TEmailLocale,
  input: TEmailCopyInput,
): TEmailCopy {
  const { textLines, ...copy } = copyBuilders[template][locale](input)

  return {
    ...copy,
    fallbackInstructions: commonCopy[locale].fallbackInstructions,
    greeting: commonCopy[locale].greeting(input.name),
    textLines: textLines.filter((line): line is string => line !== undefined),
  }
}

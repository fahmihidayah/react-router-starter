import { cookieName } from '~/paraglide/runtime.js'
import { EMAIL_LOCALES, type TEmailLocale } from './types'

export const EMAIL_LOCALE_HEADER = 'x-email-locale'

function normalizeEmailLocale(value: string | null | undefined): TEmailLocale | undefined {
  const language = value?.trim().toLowerCase().split(/[-_]/)[0]
  return EMAIL_LOCALES.find((locale) => locale === language)
}

function localeFromCookie(cookieHeader: string | null): TEmailLocale | undefined {
  if (!cookieHeader) return undefined

  for (const part of cookieHeader.split(';')) {
    const [name, ...rawValue] = part.trim().split('=')
    if (name !== cookieName) continue

    try {
      return normalizeEmailLocale(decodeURIComponent(rawValue.join('=')))
    } catch {
      return undefined
    }
  }

  return undefined
}

function localeFromAcceptLanguage(value: string | null): TEmailLocale | undefined {
  if (!value) return undefined

  for (const entry of value.split(',')) {
    const locale = normalizeEmailLocale(entry.split(';')[0])
    if (locale) return locale
  }

  return undefined
}

export function resolveEmailLocale(request?: Request): TEmailLocale {
  if (!request) return 'en'

  return (
    normalizeEmailLocale(request.headers.get(EMAIL_LOCALE_HEADER)) ??
    localeFromCookie(request.headers.get('cookie')) ??
    localeFromAcceptLanguage(request.headers.get('accept-language')) ??
    'en'
  )
}

export function withEmailLocale(headers: HeadersInit | undefined, locale: TEmailLocale): Headers {
  const localizedHeaders = new Headers(headers)
  localizedHeaders.set(EMAIL_LOCALE_HEADER, locale)
  return localizedHeaders
}

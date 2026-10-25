import { describe, expect, it } from 'vitest'
import { EMAIL_LOCALE_HEADER, resolveEmailLocale, withEmailLocale } from './locale.server'

describe('email locale', () => {
  it('prefers the explicit email locale header', () => {
    const request = new Request('https://tracker.example.com/register', {
      headers: {
        [EMAIL_LOCALE_HEADER]: 'id',
        cookie: 'PARAGLIDE_LOCALE=en',
      },
    })

    expect(resolveEmailLocale(request)).toBe('id')
  })

  it('reads the Paraglide locale cookie', () => {
    const request = new Request('https://tracker.example.com/forgot-password', {
      headers: { cookie: 'theme=dark; PARAGLIDE_LOCALE=id; session=example' },
    })

    expect(resolveEmailLocale(request)).toBe('id')
  })

  it('falls back to the supported Accept-Language and then English', () => {
    const indonesianRequest = new Request('https://tracker.example.com/register', {
      headers: { 'accept-language': 'id-ID,id;q=0.9,en;q=0.8' },
    })
    const unsupportedRequest = new Request('https://tracker.example.com/register', {
      headers: { 'accept-language': 'fr-FR,fr;q=0.9' },
    })

    expect(resolveEmailLocale(indonesianRequest)).toBe('id')
    expect(resolveEmailLocale(unsupportedRequest)).toBe('en')
    expect(resolveEmailLocale()).toBe('en')
  })

  it('adds the locale without dropping existing request headers', () => {
    const headers = withEmailLocale({ cookie: 'session=example' }, 'id')

    expect(headers.get('cookie')).toBe('session=example')
    expect(headers.get(EMAIL_LOCALE_HEADER)).toBe('id')
  })
})

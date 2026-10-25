import { describe, expect, it } from 'vitest'
import { getPostLoginPath } from './get-post-login-path'

describe('getPostLoginPath', () => {
  it('redirects admins to the admin dashboard', () => {
    expect(getPostLoginPath({ key: 'admin' })).toBe('/admin')
  })

  it('redirects standard users to their account', () => {
    expect(getPostLoginPath({ key: 'user' })).toBe('/account')
  })

  it('redirects users without a role to their account', () => {
    expect(getPostLoginPath(null)).toBe('/account')
  })

  it('does not treat an unknown role as Admin', () => {
    expect(getPostLoginPath({ key: 'content-editor' })).toBe('/account')
  })
})

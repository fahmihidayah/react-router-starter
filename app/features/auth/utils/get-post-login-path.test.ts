import { describe, expect, it } from 'vitest'
import { getPostLoginPath } from './get-post-login-path'

describe('getPostLoginPath', () => {
  it('redirects admins to the admin dashboard', () => {
    expect(getPostLoginPath({ key: 'admin' })).toBe('/admin')
  })

  it('redirects standard users to the tracker app', () => {
    expect(getPostLoginPath({ key: 'user' })).toBe('/track-app')
  })

  it('redirects users without a role to the tracker app', () => {
    expect(getPostLoginPath(null)).toBe('/track-app')
  })

  it('does not treat an unknown role as Admin', () => {
    expect(getPostLoginPath({ key: 'content-editor' })).toBe('/track-app')
  })
})

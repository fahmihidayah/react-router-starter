import { beforeEach, describe, expect, it, vi } from 'vitest'
import { auth } from '~/lib/auth'
import { action } from '~/routes/track-app/settings'
import { userContext } from '../contexts'
import * as userService from '../services'

vi.mock('../services', () => ({
  deleteById: vi.fn(),
  update: vi.fn(),
}))

vi.mock('~/lib/auth', () => ({
  auth: { api: { signOut: vi.fn() } },
}))

function actionArgs(confirmation: string) {
  const formData = new FormData()
  formData.set('intent', 'deleteAccount')
  formData.set('confirmation', confirmation)

  return {
    request: new Request('http://localhost/track-app/settings', {
      method: 'POST',
      body: formData,
      headers: { cookie: 'better-auth.session_token=token' },
    }),
    params: {},
    context: {
      get: vi.fn((context) =>
        context === userContext
          ? { user: { id: 'user-1', email: 'person@example.com' } }
          : undefined,
      ),
    } as never,
  }
}

describe('settings account deletion', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('rejects deletion when the email does not match', async () => {
    const result = await action(actionArgs('other@example.com') as never)

    expect(result).not.toBeInstanceOf(Response)
    if (result instanceof Response) throw new Error('Expected validation data')
    expect(result).toMatchObject({ success: false, intent: 'delete' })
    expect(userService.deleteById).not.toHaveBeenCalled()
  })

  it('deletes the current user and clears the session when the email matches', async () => {
    vi.mocked(userService.deleteById).mockResolvedValue(undefined)
    vi.mocked(auth.api.signOut).mockResolvedValue(
      new Response(null, {
        headers: { 'set-cookie': 'better-auth.session_token=; Max-Age=0' },
      }) as never,
    )

    const result = await action(actionArgs(' PERSON@example.com ') as never)

    expect(userService.deleteById).toHaveBeenCalledWith('user-1')
    expect(auth.api.signOut).toHaveBeenCalled()
    expect(result).toBeInstanceOf(Response)
    expect((result as Response).headers.get('location')).toBe('/login')
    expect((result as Response).headers.get('set-cookie')).toContain('Max-Age=0')
  })
})

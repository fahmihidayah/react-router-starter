import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userContext } from '~/features/users/contexts/user-context'
import type { Arguments } from '~/lib/types'

vi.mock('./auth.middleware', () => ({ requireAuth: vi.fn() }))

import { requireAuth } from './auth.middleware'
import { requireUser } from './role.middleware'

const role = {
  id: 'role-user',
  key: 'user',
  name: 'User',
  description: null,
  isSystem: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

function argsFor(emailVerified: boolean): Arguments {
  const context = new Map()
  context.set(userContext, {
    session: {
      id: 'session-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
      token: 'token',
    },
    user: {
      id: 'user-1',
      name: 'Ayu',
      email: 'ayu+family@example.com',
      emailVerified,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      role,
    },
  })
  return {
    request: new Request('http://localhost/track-app'),
    context,
    params: {},
  }
}

describe('requireUser email verification', () => {
  beforeEach(() => vi.resetAllMocks())

  it('allows a verified standard user', async () => {
    await expect(requireUser(argsFor(true))).resolves.toBeUndefined()
    expect(requireAuth).toHaveBeenCalledOnce()
  })

  it('redirects an unverified user to the verification screen', async () => {
    try {
      await requireUser(argsFor(false))
      throw new Error('Expected requireUser to redirect')
    } catch (error) {
      expect(error).toBeInstanceOf(Response)
      const response = error as Response
      expect(response.status).toBe(302)
      expect(response.headers.get('Location')).toBe(
        '/verify-email?email=ayu%2Bfamily%40example.com',
      )
    }
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userContext } from '~/features/users/contexts/user-context'
import type { Arguments } from '~/lib/types'

vi.mock('./auth.middleware', () => ({ getSession: vi.fn() }))

import { requireApiAdmin, requireApiAuth, requireApiRole } from './api-auth.middleware'
import { getSession } from './auth.middleware'

const baseSession = {
  session: {
    id: 'session-1',
    userId: 'user-1',
    expiresAt: new Date(Date.now() + 60_000),
    token: 'token',
  },
  user: {
    id: 'user-1',
    name: 'Ayu',
    email: 'ayu@example.com',
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: null,
  },
}

const adminRole = {
  id: 'role-admin',
  key: 'admin',
  name: 'Admin',
  description: null,
  isSystem: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const userRole = {
  id: 'role-user',
  key: 'user',
  name: 'User',
  description: null,
  isSystem: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

function createArgs(): Arguments {
  return {
    request: new Request('http://localhost/api/users/me'),
    context: new Map(),
    params: {},
  }
}

async function expectJsonResponse(promise: Promise<unknown>, status: number, error: string) {
  try {
    await promise
    throw new Error('Expected the middleware to reject the request')
  } catch (caught) {
    expect(caught).toBeInstanceOf(Response)
    const response = caught as Response
    expect(response.status).toBe(status)
    expect(response.headers.get('content-type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({ success: false, error })
  }
}

describe('requireApiAuth', () => {
  beforeEach(() => vi.resetAllMocks())

  it('adds an authenticated session to the user context', async () => {
    vi.mocked(getSession).mockResolvedValue(baseSession)
    const args = createArgs()

    await expect(requireApiAuth(args)).resolves.toBeUndefined()

    expect(args.context.get(userContext)).toBe(baseSession)
  })

  it('throws a JSON 401 response when the request is unauthenticated', async () => {
    vi.mocked(getSession).mockResolvedValue(null)

    await expectJsonResponse(requireApiAuth(createArgs()), 401, 'Unauthorized')
  })
})

describe('requireApiAdmin', () => {
  beforeEach(() => vi.resetAllMocks())

  it('throws a JSON 401 response when the request is unauthenticated', async () => {
    vi.mocked(getSession).mockResolvedValue(null)

    await expectJsonResponse(requireApiAdmin(createArgs()), 401, 'Unauthorized')
  })

  it('throws a JSON 403 response when the authenticated user has no role', async () => {
    vi.mocked(getSession).mockResolvedValue(baseSession)

    await expectJsonResponse(
      requireApiAdmin(createArgs()),
      403,
      'Forbidden - Insufficient permissions',
    )
  })

  it('throws a JSON 403 response when the authenticated user is not an administrator', async () => {
    vi.mocked(getSession).mockResolvedValue({
      ...baseSession,
      user: { ...baseSession.user, role: userRole },
    })

    await expectJsonResponse(
      requireApiAdmin(createArgs()),
      403,
      'Forbidden - Insufficient permissions',
    )
  })

  it('allows an authenticated administrator and exposes the session in context', async () => {
    const adminSession = { ...baseSession, user: { ...baseSession.user, role: adminRole } }
    vi.mocked(getSession).mockResolvedValue(adminSession)
    const args = createArgs()

    await expect(requireApiAdmin(args)).resolves.toBeUndefined()

    expect(args.context.get(userContext)).toBe(adminSession)
  })
})

describe('requireApiRole', () => {
  beforeEach(() => vi.resetAllMocks())

  it('accepts any one of the configured role keys', async () => {
    vi.mocked(getSession).mockResolvedValue({
      ...baseSession,
      user: { ...baseSession.user, role: userRole },
    })

    await expect(requireApiRole(createArgs(), ['admin', 'user'])).resolves.toBeUndefined()
  })
})

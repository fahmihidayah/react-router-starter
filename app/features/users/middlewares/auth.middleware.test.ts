import { redirect } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userContext } from '~/features/users/contexts/user-context'
import { auth } from '~/lib/auth'
import type { Arguments } from '~/lib/types'
import * as userQueries from '../queries'
import type { UserWithRole } from '../types'
import { getSession, requireAuth } from './auth.middleware'

vi.mock('~/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock('../queries', () => ({
  findById: vi.fn(),
  assignRoleByKey: vi.fn(),
}))

describe('auth.middleware', () => {
  describe('getSession', () => {
    const mockRequest = new Request('https://example.com/test')
    const mockUserId = 'user-123'

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('returns null when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      const result = await getSession(mockRequest)

      expect(result).toBeNull()
    })

    it('returns null when session exists but has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        session: { id: 'session-1', userId: mockUserId, expiresAt: new Date(), token: 'token' },
        user: null,
      })

      const result = await getSession(mockRequest)

      expect(result).toBeNull()
    })

    it('returns null when user is not found in database', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        session: { id: 'session-1', userId: mockUserId, expiresAt: new Date(), token: 'token' },
        user: { id: mockUserId, name: 'Test User', email: 'test@example.com' },
      })
      vi.mocked(userQueries.findById).mockResolvedValue(undefined)

      const result = await getSession(mockRequest)

      expect(result).toBeNull()
    })

    it('returns session with user when user exists with a role', async () => {
      const mockUser: UserWithRole = {
        id: mockUserId,
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: {
          id: 'role-1',
          key: 'user',
          name: 'User',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      vi.mocked(auth.api.getSession).mockResolvedValue({
        session: { id: 'session-1', userId: mockUserId, expiresAt: new Date(), token: 'token' },
        user: { id: mockUserId, name: 'Test User', email: 'test@example.com' },
      })
      vi.mocked(userQueries.findById).mockResolvedValue(mockUser)

      const result = await getSession(mockRequest)

      expect(result).not.toBeNull()
      expect(result?.user).toEqual(mockUser)
      expect(userQueries.assignRoleByKey).not.toHaveBeenCalled()
    })

    it('automatically assigns user role when user has no role and re-fetches user', async () => {
      const mockUserWithoutRole: UserWithRole = {
        id: mockUserId,
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: null,
      }

      const mockUserWithRole: UserWithRole = {
        ...mockUserWithoutRole,
        role: {
          id: 'role-1',
          key: 'user',
          name: 'User',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      vi.mocked(auth.api.getSession).mockResolvedValue({
        session: { id: 'session-1', userId: mockUserId, expiresAt: new Date(), token: 'token' },
        user: { id: mockUserId, name: 'Test User', email: 'test@example.com' },
      })
      vi.mocked(userQueries.findById)
        .mockResolvedValueOnce(mockUserWithoutRole) // First call returns user without role
        .mockResolvedValueOnce(mockUserWithRole) // Second call returns user with role

      const result = await getSession(mockRequest)

      expect(userQueries.assignRoleByKey).toHaveBeenCalledWith(mockUserId, 'user')
      expect(userQueries.findById).toHaveBeenCalledTimes(2)
      expect(result).not.toBeNull()
      expect(result?.user.role).toEqual(mockUserWithRole.role)
    })

    it('returns null when user fetch fails after role assignment', async () => {
      const mockUserWithoutRole: UserWithRole = {
        id: mockUserId,
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: null,
      }

      vi.mocked(auth.api.getSession).mockResolvedValue({
        session: { id: 'session-1', userId: mockUserId, expiresAt: new Date(), token: 'token' },
        user: { id: mockUserId, name: 'Test User', email: 'test@example.com' },
      })
      vi.mocked(userQueries.findById)
        .mockResolvedValueOnce(mockUserWithoutRole) // First call returns user without role
        .mockResolvedValueOnce(undefined) // Second call fails

      const result = await getSession(mockRequest)

      expect(userQueries.assignRoleByKey).toHaveBeenCalledWith(mockUserId, 'user')
      expect(result).toBeNull()
    })
  })

  describe('requireAuth', () => {
    const mockContext = new Map()
    const mockArgs: Arguments = {
      request: new Request('https://example.com/test'),
      context: mockContext,
      params: {},
    }

    beforeEach(() => {
      vi.clearAllMocks()
      mockContext.clear()
    })

    it('redirects to /login when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null)

      await expect(requireAuth(mockArgs)).rejects.toEqual(redirect('/login'))
      expect(mockContext.get(userContext)).toBeUndefined()
    })

    it('adds user to context when authenticated', async () => {
      const mockUser: UserWithRole = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: {
          id: 'role-1',
          key: 'user',
          name: 'User',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }

      vi.mocked(auth.api.getSession).mockResolvedValue({
        session: {
          id: 'session-1',
          userId: 'user-123',
          expiresAt: new Date(),
          token: 'token',
        },
        user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
      })
      vi.mocked(userQueries.findById).mockResolvedValue(mockUser)

      await requireAuth(mockArgs)

      const contextValue = mockContext.get(userContext)
      expect(contextValue).toBeDefined()
      expect(contextValue.user).toEqual(mockUser)
    })
  })
})

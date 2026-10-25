import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '~/lib/database'
import { findByEmail } from './find-by-email'

vi.mock('~/lib/database', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
  },
}))

describe('findByEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should find user by email', async () => {
    const mockUser = {
      role: 'user',
      banned: false,
      banReason: null,
      banExpires: null,
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userRole: {
        role: {
          id: 'role-1',
          key: 'admin',
          name: 'Admin',
          description: 'Administrator',
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    }

    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser)

    const result = await findByEmail('john@example.com')

    expect(result).toBeDefined()
    expect(result?.email).toBe('john@example.com')
    expect(result?.role?.name).toBe('Admin')
  })

  it('should return undefined when user not found', async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined)

    const result = await findByEmail('notfound@example.com')

    expect(result).toBeUndefined()
  })

  it('should handle a user with one assigned role', async () => {
    const mockUser = {
      role: 'user',
      banned: false,
      banReason: null,
      banExpires: null,
      id: '2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userRole: {
        role: {
          id: 'role-2',
          key: 'user',
          name: 'User',
          description: 'Regular User',
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    }

    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser)

    const result = await findByEmail('jane@example.com')

    expect(result?.role?.name).toBe('User')
  })
})

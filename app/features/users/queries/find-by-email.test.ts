import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findByEmail } from './find-by-email'
import { db } from '~/lib/database'

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
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: [
        {
          role: {
            id: 'role-1',
            name: 'Admin',
            description: 'Administrator',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
    }

    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser)

    const result = await findByEmail('john@example.com')

    expect(result).toBeDefined()
    expect(result?.email).toBe('john@example.com')
    expect(result?.roles).toHaveLength(1)
    expect(result?.roles[0].name).toBe('Admin')
  })

  it('should return undefined when user not found', async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue(undefined)

    const result = await findByEmail('notfound@example.com')

    expect(result).toBeUndefined()
  })

  it('should handle user with multiple roles', async () => {
    const mockUser = {
      id: '2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: [
        {
          role: {
            id: 'role-1',
            name: 'Admin',
            description: 'Administrator',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          role: {
            id: 'role-2',
            name: 'User',
            description: 'Regular User',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
    }

    vi.mocked(db.query.users.findFirst).mockResolvedValue(mockUser)

    const result = await findByEmail('jane@example.com')

    expect(result?.roles).toHaveLength(2)
    expect(result?.roles.map((r) => r.name)).toEqual(['Admin', 'User'])
  })
})

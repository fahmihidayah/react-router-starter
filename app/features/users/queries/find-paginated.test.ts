import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '~/lib/database'
import { findPaginated } from './find-paginated'

vi.mock('~/lib/database', () => ({
  db: {
    query: {
      users: {
        findMany: vi.fn(),
      },
    },
    select: vi.fn().mockReturnThis(),
  },
}))

describe('findPaginated', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return paginated users with default parameters', async () => {
    const mockUsers = [
      {
        role: 'user',
        banned: false,
        banReason: null,
        banExpires: null,
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [
          {
            role: {
              id: 'role-1',
              name: 'User',
              description: 'Regular User',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      },
      {
        role: 'user',
        banned: false,
        banReason: null,
        banExpires: null,
        id: '2',
        name: 'User 2',
        email: 'user2@example.com',
        emailVerified: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [],
      },
    ]

    vi.mocked(db.query.users.findMany).mockResolvedValue(mockUsers)

    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 2 }]),
    }
    vi.mocked(db.select).mockReturnValue(mockSelect as any)

    const result = await findPaginated({})

    expect(result.docs).toHaveLength(2)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.totalDocs).toBe(2)
    expect(result.totalPages).toBe(1)
    expect(result.hasNextPage).toBe(false)
    expect(result.hasPrevPage).toBe(false)
  })

  it('should handle pagination correctly', async () => {
    const mockUsers = Array.from({ length: 10 }, (_, i) => ({
      role: 'user',
      banned: false,
      banReason: null,
      banExpires: null,
      id: `${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: [],
    }))

    vi.mocked(db.query.users.findMany).mockResolvedValue(mockUsers)

    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 50 }]),
    }
    vi.mocked(db.select).mockReturnValue(mockSelect as any)

    const result = await findPaginated({ page: 2, limit: 10 })

    expect(result.page).toBe(2)
    expect(result.limit).toBe(10)
    expect(result.totalDocs).toBe(50)
    expect(result.totalPages).toBe(5)
    expect(result.hasNextPage).toBe(true)
    expect(result.hasPrevPage).toBe(true)
  })

  it('should handle first page correctly', async () => {
    vi.mocked(db.query.users.findMany).mockResolvedValue([])

    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 100 }]),
    }
    vi.mocked(db.select).mockReturnValue(mockSelect as any)

    const result = await findPaginated({ page: 1, limit: 20 })

    expect(result.hasNextPage).toBe(true)
    expect(result.hasPrevPage).toBe(false)
  })

  it('should handle last page correctly', async () => {
    vi.mocked(db.query.users.findMany).mockResolvedValue([])

    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 100 }]),
    }
    vi.mocked(db.select).mockReturnValue(mockSelect as any)

    const result = await findPaginated({ page: 5, limit: 20 })

    expect(result.hasNextPage).toBe(false)
    expect(result.hasPrevPage).toBe(true)
  })

  it('should filter by email', async () => {
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
      userRoles: [],
    }

    vi.mocked(db.query.users.findMany).mockResolvedValue([mockUser])

    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 1 }]),
    }
    vi.mocked(db.select).mockReturnValue(mockSelect as any)

    const result = await findPaginated({ email: 'john' })

    expect(result.docs).toHaveLength(1)
    expect(result.docs[0].email).toBe('john@example.com')
  })

  it('should handle empty results', async () => {
    vi.mocked(db.query.users.findMany).mockResolvedValue([])

    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 0 }]),
    }
    vi.mocked(db.select).mockReturnValue(mockSelect as any)

    const result = await findPaginated({})

    expect(result.docs).toHaveLength(0)
    expect(result.totalDocs).toBe(0)
    expect(result.totalPages).toBe(0)
    expect(result.hasNextPage).toBe(false)
    expect(result.hasPrevPage).toBe(false)
  })

  it('should transform user roles correctly', async () => {
    const mockUser = {
      role: 'user',
      banned: false,
      banReason: null,
      banExpires: null,
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
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

    vi.mocked(db.query.users.findMany).mockResolvedValue([mockUser])

    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 1 }]),
    }
    vi.mocked(db.select).mockReturnValue(mockSelect as any)

    const result = await findPaginated({})

    expect(result.docs[0].roles).toHaveLength(2)
    expect(result.docs[0].roles[0].name).toBe('Admin')
    expect(result.docs[0].roles[1].name).toBe('User')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { create } from './create'
import { db } from '~/lib/database'

vi.mock('~/lib/database', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
  },
}))

describe('create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new user and return the id', async () => {
    const mockUserId = 'user-123'
    const userData = {
      id: mockUserId,
      name: 'John Doe',
      email: 'john@example.com',
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockInsert = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: mockUserId }]),
    }

    vi.mocked(db.insert).mockReturnValue(mockInsert as any)

    const result = await create(userData)

    expect(result).toBe(mockUserId)
    expect(db.insert).toHaveBeenCalled()
    expect(mockInsert.values).toHaveBeenCalledWith(userData)
    expect(mockInsert.returning).toHaveBeenCalled()
  })

  it('should create user with all fields', async () => {
    const mockUserId = 'user-456'
    const userData = {
      id: mockUserId,
      name: 'Jane Smith',
      email: 'jane@example.com',
      emailVerified: true,
      image: 'https://example.com/avatar.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockInsert = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: mockUserId }]),
    }

    vi.mocked(db.insert).mockReturnValue(mockInsert as any)

    const result = await create(userData)

    expect(result).toBe(mockUserId)
    expect(mockInsert.values).toHaveBeenCalledWith(userData)
  })
})

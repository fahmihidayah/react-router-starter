import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '~/lib/database'
import { create } from './create'

vi.mock('~/lib/database', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
  },
}))

describe('create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new category and return the id', async () => {
    const mockCategoryId = 'category-123'
    const categoryData = {
      id: mockCategoryId,
      title: 'Technology',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockInsert = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: mockCategoryId }]),
    }

    vi.mocked(db.insert).mockReturnValue(mockInsert as unknown as ReturnType<typeof db.insert>)

    const result = await create(categoryData)

    expect(result).toBe(mockCategoryId)
    expect(db.insert).toHaveBeenCalled()
    expect(mockInsert.values).toHaveBeenCalledWith(categoryData)
    expect(mockInsert.returning).toHaveBeenCalled()
  })

  it('should create category with all fields', async () => {
    const mockCategoryId = 'category-456'
    const categoryData = {
      id: mockCategoryId,
      title: 'Science',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockInsert = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: mockCategoryId }]),
    }

    vi.mocked(db.insert).mockReturnValue(mockInsert as unknown as ReturnType<typeof db.insert>)

    const result = await create(categoryData)

    expect(result).toBe(mockCategoryId)
    expect(mockInsert.values).toHaveBeenCalledWith(categoryData)
  })
})

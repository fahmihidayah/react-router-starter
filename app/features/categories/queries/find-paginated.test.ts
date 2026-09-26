import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findPaginated } from './find-paginated'
import { db } from '~/lib/database'

vi.mock('~/lib/database', () => ({
  db: {
    query: {
      categories: {
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

  it('should return paginated categories with default parameters', async () => {
    const mockCategories = [
      {
        id: '1',
        title: 'Technology',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Science',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(db.query.categories.findMany).mockResolvedValue(mockCategories)

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
    const mockCategories = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Category ${i + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    vi.mocked(db.query.categories.findMany).mockResolvedValue(mockCategories)

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

  it('should filter by title', async () => {
    const mockCategory = {
      id: '1',
      title: 'Technology',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(db.query.categories.findMany).mockResolvedValue([mockCategory])

    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 1 }]),
    }
    vi.mocked(db.select).mockReturnValue(mockSelect as any)

    const result = await findPaginated({ title: 'Tech' })

    expect(result.docs).toHaveLength(1)
    expect(result.docs[0].title).toBe('Technology')
  })

  it('should handle empty results', async () => {
    vi.mocked(db.query.categories.findMany).mockResolvedValue([])

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

  it('should sort by title in ascending order', async () => {
    const mockCategories = [
      {
        id: '1',
        title: 'Art',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Business',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(db.query.categories.findMany).mockResolvedValue(mockCategories)

    const mockSelect = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ count: 2 }]),
    }
    vi.mocked(db.select).mockReturnValue(mockSelect as any)

    const result = await findPaginated({ sortBy: 'title', sortDir: 'asc' })

    expect(result.docs).toHaveLength(2)
    expect(result.docs[0].title).toBe('Art')
    expect(result.docs[1].title).toBe('Business')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findById } from './find-by-id'
import { db } from '~/lib/database'

vi.mock('~/lib/database', () => ({
  db: {
    query: {
      categories: {
        findFirst: vi.fn(),
      },
    },
  },
}))

describe('findById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should find a category by id', async () => {
    const mockCategory = {
      id: 'category-123',
      title: 'Technology',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(db.query.categories.findFirst).mockResolvedValue(mockCategory)

    const result = await findById('category-123')

    expect(result).toEqual(mockCategory)
    expect(db.query.categories.findFirst).toHaveBeenCalledWith({
      where: expect.anything(),
    })
  })

  it('should return undefined when category is not found', async () => {
    vi.mocked(db.query.categories.findFirst).mockResolvedValue(undefined)

    const result = await findById('non-existent-category')

    expect(result).toBeUndefined()
    expect(db.query.categories.findFirst).toHaveBeenCalledWith({
      where: expect.anything(),
    })
  })
})

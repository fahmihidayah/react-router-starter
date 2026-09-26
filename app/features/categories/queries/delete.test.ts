import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteById } from './delete'
import { db } from '~/lib/database'

vi.mock('~/lib/database', () => ({
  db: {
    delete: vi.fn().mockReturnThis(),
  },
}))

describe('deleteById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete a category by id', async () => {
    const categoryId = 'category-123'

    const mockDelete = {
      where: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(db.delete).mockReturnValue(mockDelete as any)

    await deleteById(categoryId)

    expect(db.delete).toHaveBeenCalled()
    expect(mockDelete.where).toHaveBeenCalled()
  })

  it('should handle deletion of non-existent category', async () => {
    const categoryId = 'non-existent-category'

    const mockDelete = {
      where: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(db.delete).mockReturnValue(mockDelete as any)

    await expect(deleteById(categoryId)).resolves.not.toThrow()

    expect(db.delete).toHaveBeenCalled()
    expect(mockDelete.where).toHaveBeenCalled()
  })
})

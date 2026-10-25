import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '~/lib/database'
import { deleteById } from './delete'

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

    vi.mocked(db.delete).mockReturnValue(mockDelete as unknown as ReturnType<typeof db.delete>)

    await deleteById(categoryId)

    expect(db.delete).toHaveBeenCalled()
    expect(mockDelete.where).toHaveBeenCalled()
  })

  it('should handle deletion of non-existent category', async () => {
    const categoryId = 'non-existent-category'

    const mockDelete = {
      where: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(db.delete).mockReturnValue(mockDelete as unknown as ReturnType<typeof db.delete>)

    await expect(deleteById(categoryId)).resolves.not.toThrow()

    expect(db.delete).toHaveBeenCalled()
    expect(mockDelete.where).toHaveBeenCalled()
  })
})

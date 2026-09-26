import { describe, it, expect, vi, beforeEach } from 'vitest'
import { update } from './update'
import { db } from '~/lib/database'

vi.mock('~/lib/database', () => ({
  db: {
    update: vi.fn().mockReturnThis(),
  },
}))

describe('update', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update category title', async () => {
    const categoryId = 'category-123'
    const updateData = { title: 'Updated Title' }

    const mockUpdate = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(db.update).mockReturnValue(mockUpdate as any)

    await update(categoryId, updateData)

    expect(db.update).toHaveBeenCalled()
    expect(mockUpdate.set).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Updated Title',
        updatedAt: expect.any(Date),
      })
    )
    expect(mockUpdate.where).toHaveBeenCalled()
  })

  it('should handle empty update data', async () => {
    const categoryId = 'category-123'
    const updateData = {}

    const mockUpdate = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(db.update).mockReturnValue(mockUpdate as any)

    await update(categoryId, updateData)

    expect(mockUpdate.set).toHaveBeenCalledWith(
      expect.objectContaining({
        updatedAt: expect.any(Date),
      })
    )
  })
})

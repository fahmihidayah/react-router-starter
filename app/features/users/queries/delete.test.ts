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

  it('should delete user by id', async () => {
    const userId = 'user-123'

    const mockDelete = {
      where: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(db.delete).mockReturnValue(mockDelete as any)

    await deleteById(userId)

    expect(db.delete).toHaveBeenCalled()
    expect(mockDelete.where).toHaveBeenCalled()
  })

  it('should handle deletion of non-existent user', async () => {
    const userId = 'non-existent-user'

    const mockDelete = {
      where: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(db.delete).mockReturnValue(mockDelete as any)

    await expect(deleteById(userId)).resolves.not.toThrow()
  })

  it('should delete user with various id formats', async () => {
    const userIds = ['user-1', 'uuid-12345', 'abc123']

    const mockDelete = {
      where: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(db.delete).mockReturnValue(mockDelete as any)

    for (const userId of userIds) {
      await deleteById(userId)
      expect(mockDelete.where).toHaveBeenCalled()
      vi.clearAllMocks()
      vi.mocked(db.delete).mockReturnValue(mockDelete as any)
    }
  })
})

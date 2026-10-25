import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '~/lib/database'
import { deleteById } from './delete'

vi.mock('~/lib/database', () => ({
  db: {
    transaction: vi.fn(),
  },
}))

describe('deleteById', () => {
  const where = vi.fn().mockResolvedValue(undefined)
  const transaction = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({ where: vi.fn().mockResolvedValue([]) })),
    })),
    delete: vi.fn(() => ({ where })),
  }

  beforeEach(() => {
    vi.resetAllMocks()
    transaction.select.mockImplementation(() => ({
      from: vi.fn(() => ({ where: vi.fn().mockResolvedValue([]) })),
    }))
    transaction.delete.mockImplementation(() => ({ where }))
    vi.mocked(db.transaction).mockImplementation(async (callback) => callback(transaction as never))
  })

  it('should delete user by id', async () => {
    const userId = 'user-123'

    await deleteById(userId)

    expect(db.transaction).toHaveBeenCalledOnce()
    expect(transaction.delete).toHaveBeenCalled()
    expect(where).toHaveBeenCalled()
  })

  it('should handle deletion of non-existent user', async () => {
    const userId = 'non-existent-user'

    await expect(deleteById(userId)).resolves.not.toThrow()
  })

  it('should delete user with various id formats', async () => {
    const userIds = ['user-1', 'uuid-12345', 'abc123']

    for (const userId of userIds) {
      await deleteById(userId)
    }

    expect(db.transaction).toHaveBeenCalledTimes(userIds.length)
  })
})

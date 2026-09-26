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

  it('should update user email and name', async () => {
    const userId = 'user-123'
    const updateData = {
      email: 'newemail@example.com',
      name: 'New Name',
    }

    const mockUpdate = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(db.update).mockReturnValue(mockUpdate as any)

    await update(userId, updateData)

    expect(db.update).toHaveBeenCalled()
    expect(mockUpdate.set).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'newemail@example.com',
        name: 'New Name',
        updatedAt: expect.any(Date),
      })
    )
    expect(mockUpdate.where).toHaveBeenCalled()
  })

  it('should update only email', async () => {
    const userId = 'user-456'
    const updateData = {
      email: 'updated@example.com',
    }

    const mockUpdate = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(db.update).mockReturnValue(mockUpdate as any)

    await update(userId, updateData)

    expect(mockUpdate.set).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'updated@example.com',
        updatedAt: expect.any(Date),
      })
    )
  })

  it('should update only name', async () => {
    const userId = 'user-789'
    const updateData = {
      name: 'Updated Name',
    }

    const mockUpdate = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(db.update).mockReturnValue(mockUpdate as any)

    await update(userId, updateData)

    expect(mockUpdate.set).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Updated Name',
        updatedAt: expect.any(Date),
      })
    )
  })

  it('should always update updatedAt timestamp', async () => {
    const userId = 'user-999'
    const updateData = {
      name: 'Test User',
    }

    const mockUpdate = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(db.update).mockReturnValue(mockUpdate as any)

    await update(userId, updateData)

    const setCall = mockUpdate.set.mock.calls[0][0]
    expect(setCall.updatedAt).toBeInstanceOf(Date)
  })
})

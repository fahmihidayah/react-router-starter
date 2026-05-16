import { afterEach, describe, expect, it, vi } from 'vitest'
import { deleteManyMediaAction } from './delete-many-media-action'

vi.mock('../repositories', () => ({
  mediaRepository: {
    deleteMany: vi.fn(),
  },
}))

vi.mock('drizzle-orm', () => ({
  inArray: vi.fn((field, values) => ({ field, values })),
}))

import { mediaRepository } from '../repositories'
import { inArray } from 'drizzle-orm'

describe('deleteManyMediaAction', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('deletes multiple media and returns success', async () => {
    vi.mocked(mediaRepository.deleteMany).mockResolvedValue(undefined)

    const result = await deleteManyMediaAction(['m1', 'm2', 'm3'])

    expect(result).toEqual({ success: true })
  })

  it('calls deleteMany with inArray condition', async () => {
    vi.mocked(mediaRepository.deleteMany).mockResolvedValue(undefined)

    await deleteManyMediaAction(['m1', 'm2', 'm3'])

    expect(mediaRepository.deleteMany).toHaveBeenCalled()
    expect(inArray).toHaveBeenCalled()
  })

  it('deletes correct number of media', async () => {
    vi.mocked(mediaRepository.deleteMany).mockResolvedValue(undefined)

    const ids = ['m1', 'm2', 'm3', 'm4', 'm5']
    await deleteManyMediaAction(ids)

    expect(mediaRepository.deleteMany).toHaveBeenCalledTimes(1)
  })

  it('returns false when empty array is provided', async () => {
    const result = await deleteManyMediaAction([])

    expect(result).toEqual({ success: false })
    expect(mediaRepository.deleteMany).not.toHaveBeenCalled()
  })

  it('deletes single media in array', async () => {
    vi.mocked(mediaRepository.deleteMany).mockResolvedValue(undefined)

    const result = await deleteManyMediaAction(['m1'])

    expect(result).toEqual({ success: true })
    expect(mediaRepository.deleteMany).toHaveBeenCalled()
  })

  it('deletes large batch of media', async () => {
    vi.mocked(mediaRepository.deleteMany).mockResolvedValue(undefined)

    const ids = Array.from({ length: 100 }, (_, i) => `m${i + 1}`)
    const result = await deleteManyMediaAction(ids)

    expect(result).toEqual({ success: true })
    expect(mediaRepository.deleteMany).toHaveBeenCalled()
  })

  it('throws error when deletion fails', async () => {
    const error = new Error('Database error')
    vi.mocked(mediaRepository.deleteMany).mockRejectedValue(error)

    await expect(deleteManyMediaAction(['m1', 'm2'])).rejects.toThrow('Database error')
  })

  it('logs error when bulk delete fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Bulk delete failed')
    vi.mocked(mediaRepository.deleteMany).mockRejectedValue(error)

    try {
      await deleteManyMediaAction(['m1', 'm2'])
    } catch {
      // Expected error
    }

    expect(consoleSpy).toHaveBeenCalledWith('Bulk delete error:', error)
    consoleSpy.mockRestore()
  })

  it('handles media IDs with different formats', async () => {
    vi.mocked(mediaRepository.deleteMany).mockResolvedValue(undefined)

    const ids = ['uuid-1', 'uuid-2', 'short-id-3']
    const result = await deleteManyMediaAction(ids)

    expect(result).toEqual({ success: true })
  })

  it('prevents deletion of empty array without calling repository', async () => {
    const result = await deleteManyMediaAction([])

    expect(result.success).toBe(false)
    expect(mediaRepository.deleteMany).not.toHaveBeenCalled()
  })

  it('successfully deletes media after validation', async () => {
    vi.mocked(mediaRepository.deleteMany).mockResolvedValue(undefined)

    const ids = ['m1', 'm2', 'm3']
    const result = await deleteManyMediaAction(ids)

    expect(result.success).toBe(true)
    expect(mediaRepository.deleteMany).toHaveBeenCalledTimes(1)
  })

  it('handles deletion of duplicate IDs', async () => {
    vi.mocked(mediaRepository.deleteMany).mockResolvedValue(undefined)

    const ids = ['m1', 'm2', 'm1', 'm3']
    const result = await deleteManyMediaAction(ids)

    expect(result).toEqual({ success: true })
    expect(mediaRepository.deleteMany).toHaveBeenCalled()
  })
})

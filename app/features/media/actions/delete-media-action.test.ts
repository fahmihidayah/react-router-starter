import { afterEach, describe, expect, it, vi } from 'vitest'
import { deleteMediaAction } from './delete-media-action'

vi.mock('../repositories', () => ({
  mediaRepository: {
    delete: vi.fn(),
  },
}))

import { mediaRepository } from '../repositories'

describe('deleteMediaAction', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('deletes media and returns success', async () => {
    vi.mocked(mediaRepository.delete).mockResolvedValue(undefined)

    const result = await deleteMediaAction('m1')

    expect(result).toEqual({ success: true })
  })

  it('calls repository delete with media ID', async () => {
    vi.mocked(mediaRepository.delete).mockResolvedValue(undefined)

    await deleteMediaAction('m1')

    expect(mediaRepository.delete).toHaveBeenCalledWith('m1')
  })

  it('deletes media with correct ID', async () => {
    vi.mocked(mediaRepository.delete).mockResolvedValue(undefined)

    await deleteMediaAction('specific-media-id')

    expect(mediaRepository.delete).toHaveBeenCalledWith('specific-media-id')
  })

  it('throws error when deletion fails', async () => {
    const error = new Error('Database error')
    vi.mocked(mediaRepository.delete).mockRejectedValue(error)

    await expect(deleteMediaAction('m1')).rejects.toThrow('Database error')
  })

  it('throws error on media not found', async () => {
    const error = new Error('Media not found')
    vi.mocked(mediaRepository.delete).mockRejectedValue(error)

    await expect(deleteMediaAction('nonexistent')).rejects.toThrow('Media not found')
  })

  it('returns success for valid media ID', async () => {
    vi.mocked(mediaRepository.delete).mockResolvedValue(undefined)

    const result = await deleteMediaAction('valid-id')

    expect(result.success).toBe(true)
  })

  it('handles multiple sequential deletes', async () => {
    vi.mocked(mediaRepository.delete).mockResolvedValue(undefined)

    await deleteMediaAction('m1')
    await deleteMediaAction('m2')
    await deleteMediaAction('m3')

    expect(mediaRepository.delete).toHaveBeenCalledTimes(3)
    expect(mediaRepository.delete).toHaveBeenNthCalledWith(1, 'm1')
    expect(mediaRepository.delete).toHaveBeenNthCalledWith(2, 'm2')
    expect(mediaRepository.delete).toHaveBeenNthCalledWith(3, 'm3')
  })

  it('logs error when deletion fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Delete failed')
    vi.mocked(mediaRepository.delete).mockRejectedValue(error)

    try {
      await deleteMediaAction('m1')
    } catch {
      // Expected error
    }

    expect(consoleSpy).toHaveBeenCalledWith('Delete error:', error)
    consoleSpy.mockRestore()
  })
})

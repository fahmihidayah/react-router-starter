import { describe, it, expect, vi, afterEach } from 'vitest'
import { deleteManyCategoriesAction } from './delete-many-categories-action'

vi.mock('../repositories', () => ({
  categoryRepository: {
    deleteMany: vi.fn(),
  },
}))

import { categoryRepository } from '../repositories'

describe('deleteManyCategoriesAction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deletes multiple categories and returns success', async () => {
    vi.mocked(categoryRepository.deleteMany).mockResolvedValue([] as never)

    const result = await deleteManyCategoriesAction(['c1', 'c2', 'c3'])

    expect(result.success).toBe(true)
    expect(categoryRepository.deleteMany).toHaveBeenCalledOnce()
  })

  it('returns failure when given empty array', async () => {
    vi.mocked(categoryRepository.deleteMany).mockClear()
    vi.mocked(categoryRepository.deleteMany).mockResolvedValue([] as never)

    const result = await deleteManyCategoriesAction([])

    expect(result.success).toBe(false)
    expect(categoryRepository.deleteMany).not.toHaveBeenCalled()
  })

  it('throws error when repository fails', async () => {
    vi.mocked(categoryRepository.deleteMany).mockRejectedValue(new Error('DB error'))

    await expect(deleteManyCategoriesAction(['c1'])).rejects.toThrow('DB error')
  })
})

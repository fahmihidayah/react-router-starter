import { describe, it, expect, vi, afterEach } from 'vitest'
import { deleteCategoryAction } from './delete-category-action'

vi.mock('../repositories', () => ({
  categoryRepository: {
    delete: vi.fn(),
  },
}))

import { categoryRepository } from '../repositories'

describe('deleteCategoryAction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deletes a category and returns success', async () => {
    vi.mocked(categoryRepository.delete).mockResolvedValue(undefined)

    const result = await deleteCategoryAction('c1')

    expect(result.success).toBe(true)
    expect(categoryRepository.delete).toHaveBeenCalledWith('c1')
  })

  it('throws error when repository fails', async () => {
    vi.mocked(categoryRepository.delete).mockRejectedValue(new Error('DB error'))

    await expect(deleteCategoryAction('c1')).rejects.toThrow('DB error')
  })
})

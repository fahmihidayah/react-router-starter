import { describe, it, expect, vi, afterEach } from 'vitest'
import { deleteManyCategoriesAction } from './delete-many-categories-action'
import { InvalidCategoryDataError } from '../types/errors/category-errors'

vi.mock('../services', () => ({
  deleteMany: vi.fn(),
}))

import * as categoryService from '../services'

describe('deleteManyCategoriesAction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deletes multiple categories and returns success', async () => {
    vi.mocked(categoryService.deleteMany).mockResolvedValue(undefined)

    const result = await deleteManyCategoriesAction(['c1', 'c2', 'c3'])

    expect(result.success).toBe(true)
    expect(categoryService.deleteMany).toHaveBeenCalledWith(['c1', 'c2', 'c3'])
  })

  it('returns failure when given empty array', async () => {
    vi.mocked(categoryService.deleteMany).mockRejectedValue(
      new InvalidCategoryDataError('Invalid category IDs provided')
    )

    const result = await deleteManyCategoriesAction([])

    expect(result.success).toBe(false)
    expect(result.message).toBeDefined()
  })

  it('throws error when service fails with unexpected error', async () => {
    vi.mocked(categoryService.deleteMany).mockRejectedValue(new Error('DB error'))

    await expect(deleteManyCategoriesAction(['c1'])).rejects.toThrow('DB error')
  })
})

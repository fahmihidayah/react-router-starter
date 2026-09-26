import { describe, it, expect, vi, afterEach } from 'vitest'
import { deleteCategoryAction } from './delete-category-action'
import { CategoryNotFoundError } from '../types/errors/category-errors'

vi.mock('../services', () => ({
  deleteById: vi.fn(),
}))

import * as categoryService from '../services'

describe('deleteCategoryAction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deletes a category and returns success', async () => {
    vi.mocked(categoryService.deleteById).mockResolvedValue(undefined)

    const result = await deleteCategoryAction('c1')

    expect(result.success).toBe(true)
    expect(categoryService.deleteById).toHaveBeenCalledWith('c1')
  })

  it('returns failure when category is not found', async () => {
    vi.mocked(categoryService.deleteById).mockRejectedValue(
      new CategoryNotFoundError()
    )

    const result = await deleteCategoryAction('c1')

    expect(result.success).toBe(false)
    expect(result.message).toBeDefined()
  })

  it('throws error when service fails with unexpected error', async () => {
    vi.mocked(categoryService.deleteById).mockRejectedValue(new Error('DB error'))

    await expect(deleteCategoryAction('c1')).rejects.toThrow('DB error')
  })
})

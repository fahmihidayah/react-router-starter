import { describe, it, expect, vi, afterEach } from 'vitest'
import { updateCategoryAction } from './update-category-action'

vi.mock('../repositories', () => ({
  categoryRepository: {
    update: vi.fn(),
  },
}))

import { categoryRepository } from '../repositories'

function buildFormRequest(data: Record<string, string>): Request {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => formData.append(key, value))
  return new Request('http://localhost/dashboard/categories/c1', {
    method: 'POST',
    body: formData,
  })
}

describe('updateCategoryAction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('updates a category and redirects on success', async () => {
    vi.mocked(categoryRepository.update).mockResolvedValue(undefined)

    const request = buildFormRequest({ title: 'Updated Category' })
    await updateCategoryAction(request, 'c1')

    expect(categoryRepository.update).toHaveBeenCalledWith(
      'c1',
      expect.objectContaining({ title: 'Updated Category' }),
    )
  })

  it('returns validation errors when title is empty', async () => {
    const request = buildFormRequest({ title: '' })
    const result = await updateCategoryAction(request, 'c1')

    expect(result).toHaveProperty('errors')
    const errorResult = result as { errors: Record<string, string[] | undefined> }
    expect(errorResult.errors?.title).toBeDefined()
  })

  it('returns validation errors when title exceeds max length', async () => {
    const longTitle = 'a'.repeat(101)
    const request = buildFormRequest({ title: longTitle })
    const result = await updateCategoryAction(request, 'c1')

    expect(result).toHaveProperty('errors')
    const errorResult = result as { errors: Record<string, string[] | undefined> }
    expect(errorResult.errors?.title).toBeDefined()
  })

  it('returns failure when repository throws', async () => {
    vi.mocked(categoryRepository.update).mockRejectedValue(new Error('DB error'))

    const request = buildFormRequest({ title: 'Test Category' })
    const result = await updateCategoryAction(request, 'c1')

    expect(result).toHaveProperty('errors')
    const errorResult = result as { errors: Record<string, string[] | undefined> }
    expect(errorResult.errors?.title?.[0]).toContain('Failed')
  })
})

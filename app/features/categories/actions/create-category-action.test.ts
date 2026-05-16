import { describe, it, expect, vi, afterEach } from 'vitest'
import { createCategoryAction } from './create-category-action'

vi.mock('../repositories', () => ({
  categoryRepository: {
    create: vi.fn(),
  },
}))

import { categoryRepository } from '../repositories'

function buildFormRequest(data: Record<string, string>): Request {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => formData.append(key, value))
  return new Request('http://localhost/dashboard/categories', {
    method: 'POST',
    body: formData,
  })
}

describe('createCategoryAction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a category and redirects on success', async () => {
    vi.mocked(categoryRepository.create).mockResolvedValue({
      id: 'generated-id',
      title: 'New Category',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildFormRequest({ title: 'New Category' })
    const result = await createCategoryAction(request)

    expect(categoryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Category' }),
    )
  })

  it('returns validation errors when title is empty', async () => {
    const request = buildFormRequest({ title: '' })
    const result = await createCategoryAction(request)

    expect(result).toHaveProperty('errors')
    const errorResult = result as { errors: Record<string, string[] | undefined> }
    expect(errorResult.errors?.title).toBeDefined()
  })

  it('returns validation errors when title exceeds max length', async () => {
    const longTitle = 'a'.repeat(101)
    const request = buildFormRequest({ title: longTitle })
    const result = await createCategoryAction(request)

    expect(result).toHaveProperty('errors')
    const errorResult = result as { errors: Record<string, string[] | undefined> }
    expect(errorResult.errors?.title).toBeDefined()
  })

  it('returns failure when repository throws', async () => {
    vi.mocked(categoryRepository.create).mockRejectedValue(new Error('DB error'))

    const request = buildFormRequest({ title: 'Test Category' })
    const result = await createCategoryAction(request)

    expect(result).toHaveProperty('errors')
    const errorResult = result as { errors: Record<string, string[] | undefined> }
    expect(errorResult.errors?.title?.[0]).toContain('Failed')
  })
})

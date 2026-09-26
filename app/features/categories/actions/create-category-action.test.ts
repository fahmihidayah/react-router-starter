import { describe, it, expect, vi, afterEach } from 'vitest'
import type { ActionArgs } from '~/lib/types'
import { createCategoryAction } from './create-category-action'

vi.mock('../services', () => ({
  create: vi.fn(),
}))

import * as categoryService from '../services'

function buildActionArgs(data: Record<string, string>): ActionArgs {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => formData.append(key, value))
  const request = new Request('http://localhost/dashboard/categories', {
    method: 'POST',
    body: formData,
  })
  return {
    request,
    context: new Map(),
    params: {},
  }
}

describe('createCategoryAction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a category and redirects on success', async () => {
    vi.mocked(categoryService.create).mockResolvedValue('generated-id')

    const args = buildActionArgs({ title: 'New Category' })
    const result = await createCategoryAction(args)

    expect(categoryService.create).toHaveBeenCalledWith({ title: 'New Category' })
  })

  it('returns validation errors when title is empty', async () => {
    const args = buildActionArgs({ title: '' })
    const result = await createCategoryAction(args)

    expect(result).toHaveProperty('errors')
    const errorResult = result as { errors: Record<string, string[] | undefined> }
    expect(errorResult.errors?.title).toBeDefined()
  })

  it('returns validation errors when title exceeds max length', async () => {
    const longTitle = 'a'.repeat(101)
    const args = buildActionArgs({ title: longTitle })
    const result = await createCategoryAction(args)

    expect(result).toHaveProperty('errors')
    const errorResult = result as { errors: Record<string, string[] | undefined> }
    expect(errorResult.errors?.title).toBeDefined()
  })

  it('returns failure when service throws', async () => {
    vi.mocked(categoryService.create).mockRejectedValue(new Error('DB error'))

    const args = buildActionArgs({ title: 'Test Category' })
    const result = await createCategoryAction(args)

    expect(result).toHaveProperty('errors')
    const errorResult = result as { errors: Record<string, string[] | undefined> }
    expect(errorResult.errors?.title?.[0]).toContain('An unexpected error occurred')
  })
})

import { describe, it, expect, vi, afterEach } from 'vitest'
import type { ActionArgs } from '~/lib/types'
import { updateCategoryAction } from './update-category-action'

vi.mock('../services', () => ({
  update: vi.fn(),
}))

import * as categoryService from '../services'

function buildActionArgs(data: Record<string, string>, id: string): ActionArgs {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => formData.append(key, value))
  const request = new Request(`http://localhost/dashboard/categories/${id}`, {
    method: 'POST',
    body: formData,
  })
  return {
    request,
    context: new Map(),
    params: { id },
  }
}

describe('updateCategoryAction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('updates a category and redirects on success', async () => {
    vi.mocked(categoryService.update).mockResolvedValue(undefined)

    const args = buildActionArgs({ title: 'Updated Category' }, 'c1')
    await updateCategoryAction(args)

    expect(categoryService.update).toHaveBeenCalledWith('c1', { title: 'Updated Category' })
  })

  it('returns validation errors when title is empty', async () => {
    const args = buildActionArgs({ title: '' }, 'c1')
    const result = await updateCategoryAction(args)

    expect(result).toHaveProperty('errors')
    const errorResult = result as { errors: Record<string, string[] | undefined> }
    expect(errorResult.errors?.title).toBeDefined()
  })

  it('returns validation errors when title exceeds max length', async () => {
    const longTitle = 'a'.repeat(101)
    const args = buildActionArgs({ title: longTitle }, 'c1')
    const result = await updateCategoryAction(args)

    expect(result).toHaveProperty('errors')
    const errorResult = result as { errors: Record<string, string[] | undefined> }
    expect(errorResult.errors?.title).toBeDefined()
  })

  it('returns failure when service throws', async () => {
    vi.mocked(categoryService.update).mockRejectedValue(new Error('DB error'))

    const args = buildActionArgs({ title: 'Test Category' }, 'c1')
    const result = await updateCategoryAction(args)

    expect(result).toHaveProperty('errors')
    const errorResult = result as { errors: Record<string, string[] | undefined> }
    expect(errorResult.errors?.title?.[0]).toContain('An unexpected error occurred')
  })
})

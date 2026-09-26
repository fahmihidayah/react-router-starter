import { afterEach, describe, expect, it, vi } from 'vitest'
import { getCategoriesLoader } from './get-categories-loader'

vi.mock('../services', () => ({ findPaginated: vi.fn() }))

import * as categoryService from '../services'

describe('getCategoriesLoader', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('parses page and limit from URL search params', async () => {
    const mockResult = {
      docs: [],
      page: 2,
      limit: 5,
      totalDocs: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: true,
    }
    vi.mocked(categoryService.findPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/dashboard/categories?page=2&limit=5')
    await getCategoriesLoader(request)

    expect(categoryService.findPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 5 }),
    )
  })

  it('defaults to page 1 and limit 10 when params are missing', async () => {
    const mockResult = {
      docs: [],
      page: 1,
      limit: 10,
      totalDocs: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    }
    vi.mocked(categoryService.findPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/dashboard/categories')
    await getCategoriesLoader(request)

    expect(categoryService.findPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    )
  })

  it('passes search filter as like() clause when search param exists', async () => {
    const mockResult = {
      docs: [{ id: 'c1', title: 'Electronics', createdAt: new Date(), updatedAt: new Date() }],
      page: 1,
      limit: 10,
      totalDocs: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    }
    vi.mocked(categoryService.findPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/dashboard/categories?search=electronics')
    const result = await getCategoriesLoader(request)

    expect(categoryService.findPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'electronics' }),
    )
    expect(result.docs).toHaveLength(1)
  })

  it('returns paginated response with correct structure', async () => {
    const mockResult = {
      docs: [{ id: 'c1', title: 'Electronics', createdAt: new Date(), updatedAt: new Date() }],
      page: 1,
      limit: 10,
      totalDocs: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    }
    vi.mocked(categoryService.findPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/dashboard/categories')
    const result = await getCategoriesLoader(request)

    expect(result).toEqual(
      expect.objectContaining({
        docs: expect.any(Array),
        page: 1,
        limit: 10,
        totalDocs: 1,
        totalPages: 1,
      }),
    )
  })
})

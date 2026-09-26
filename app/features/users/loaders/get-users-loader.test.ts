import { afterEach, describe, expect, it, vi } from 'vitest'
import type { LoaderArgs } from '~/lib/types'
import { getUsersLoader } from './get-users-loader'

vi.mock('../services', () => ({
  findPaginated: vi.fn(),
}))

import * as userService from '../services'

function buildLoaderArgs(request: Request): LoaderArgs {
  return {
    request,
    context: new Map(),
    params: {},
  }
}

describe('getUsersLoader', () => {
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
    vi.mocked(userService.findPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/admin/users?page=2&limit=5')
    await getUsersLoader(buildLoaderArgs(request))

    expect(userService.findPaginated).toHaveBeenCalledWith(
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
    vi.mocked(userService.findPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/admin/users')
    await getUsersLoader(buildLoaderArgs(request))

    expect(userService.findPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    )
  })

  it('passes search filter as name param when search exists', async () => {
    const mockResult = {
      docs: [
        {
          id: 'u1',
          name: 'Widget User',
          email: 'widget@example.com',
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          roles: [],
        },
      ],
      page: 1,
      limit: 10,
      totalDocs: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    }
    vi.mocked(userService.findPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/admin/users?search=widget')
    const response = await getUsersLoader(buildLoaderArgs(request))
    const result = response.data
    if (!result) throw new Error('Expected paginated data')

    expect(userService.findPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'widget' }),
    )
    expect(result.docs).toHaveLength(1)
  })

  it('does not pass name when search param is empty', async () => {
    const mockResult = {
      docs: [],
      page: 1,
      limit: 10,
      totalDocs: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    }
    vi.mocked(userService.findPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/admin/users')
    await getUsersLoader(buildLoaderArgs(request))

    expect(userService.findPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ name: undefined }),
    )
  })

  it('returns PaginateDocs format', async () => {
    const mockResult = {
      docs: [
        {
          id: 'u1',
          name: 'Alice',
          email: 'alice@example.com',
          emailVerified: true,
          image: null,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          roles: [],
        },
      ],
      page: 1,
      limit: 10,
      totalDocs: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    }
    vi.mocked(userService.findPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/admin/users')
    const response = await getUsersLoader(buildLoaderArgs(request))
    const result = response.data
    if (!result) throw new Error('Expected paginated data')

    expect(result).toEqual(mockResult)
  })

  it('handles empty search results', async () => {
    const mockResult = {
      docs: [],
      page: 1,
      limit: 10,
      totalDocs: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    }
    vi.mocked(userService.findPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/admin/users?search=nonexistent')
    const response = await getUsersLoader(buildLoaderArgs(request))
    const result = response.data
    if (!result) throw new Error('Expected paginated data')

    expect(result.docs).toHaveLength(0)
    expect(result.totalDocs).toBe(0)
  })

  it('handles multiple pages correctly', async () => {
    const mockResult = {
      docs: [
        {
          id: 'u1',
          name: 'User 1',
          email: 'user1@example.com',
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          roles: [],
        },
        {
          id: 'u2',
          name: 'User 2',
          email: 'user2@example.com',
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          roles: [],
        },
      ],
      page: 2,
      limit: 2,
      totalDocs: 25,
      totalPages: 13,
      hasNextPage: true,
      hasPrevPage: true,
    }
    vi.mocked(userService.findPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/admin/users?page=2&limit=2')
    const response = await getUsersLoader(buildLoaderArgs(request))
    const result = response.data
    if (!result) throw new Error('Expected paginated data')

    expect(result.page).toBe(2)
    expect(result.limit).toBe(2)
    expect(result.totalDocs).toBe(25)
    expect(result.totalPages).toBe(13)
    expect(result.hasNextPage).toBe(true)
    expect(result.hasPrevPage).toBe(true)
  })
})

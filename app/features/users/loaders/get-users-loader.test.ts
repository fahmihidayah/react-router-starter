import { describe, it, expect, vi, afterEach } from 'vitest'
import { getUsersLoader } from './get-users-loader'

vi.mock('../repositories', () => ({
  userRepository: {
    findManyPaginated: vi.fn(),
  },
}))

import { userRepository } from '../repositories'

describe('getUsersLoader', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('parses page and pageSize from URL search params', async () => {
    const mockResult = {
      data: [],
      pagination: {
        totalItems: 0,
        currentPage: 2,
        pageSize: 5,
        totalPages: 0,
      },
    }
    vi.mocked(userRepository.findManyPaginated).mockResolvedValue(mockResult)

    const request = new Request(
      'http://localhost/dashboard/users?page=2&pageSize=5'
    )
    await getUsersLoader(request)

    expect(userRepository.findManyPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 5 })
    )
  })

  it('defaults to page 1 and pageSize 10 when params are missing', async () => {
    const mockResult = {
      data: [],
      pagination: {
        totalItems: 0,
        currentPage: 1,
        pageSize: 10,
        totalPages: 0,
      },
    }
    vi.mocked(userRepository.findManyPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/dashboard/users')
    await getUsersLoader(request)

    expect(userRepository.findManyPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 10 })
    )
  })

  it('passes search filter as like() clause when search param exists', async () => {
    const mockResult = {
      data: [
        {
          id: 'u1',
          name: 'Widget User',
          email: 'widget@example.com',
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      pagination: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 },
    }
    vi.mocked(userRepository.findManyPaginated).mockResolvedValue(mockResult)

    const request = new Request(
      'http://localhost/dashboard/users?search=widget'
    )
    const result = await getUsersLoader(request)

    expect(userRepository.findManyPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.anything() })
    )
    expect(result.users).toHaveLength(1)
  })

  it('does not pass where clause when search param is empty', async () => {
    const mockResult = {
      data: [],
      pagination: {
        totalItems: 0,
        currentPage: 1,
        pageSize: 10,
        totalPages: 0,
      },
    }
    vi.mocked(userRepository.findManyPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/dashboard/users')
    await getUsersLoader(request)

    expect(userRepository.findManyPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined })
    )
  })

  it('returns flat shape expected by the route', async () => {
    const mockResult = {
      data: [
        {
          id: 'u1',
          name: 'Alice',
          email: 'alice@example.com',
          emailVerified: true,
          image: null,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
        },
      ],
      pagination: { totalItems: 1, currentPage: 1, pageSize: 10, totalPages: 1 },
    }
    vi.mocked(userRepository.findManyPaginated).mockResolvedValue(mockResult)

    const request = new Request('http://localhost/dashboard/users')
    const result = await getUsersLoader(request)

    expect(result).toEqual({
      users: [
        {
          id: 'u1',
          name: 'Alice',
          email: 'alice@example.com',
          emailVerified: true,
          image: null,
          createdAt: mockResult.data[0].createdAt,
          updatedAt: mockResult.data[0].updatedAt,
        },
      ],
      totalCount: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    })
  })

  it('handles empty search results', async () => {
    const mockResult = {
      data: [],
      pagination: {
        totalItems: 0,
        currentPage: 1,
        pageSize: 10,
        totalPages: 0,
      },
    }
    vi.mocked(userRepository.findManyPaginated).mockResolvedValue(mockResult)

    const request = new Request(
      'http://localhost/dashboard/users?search=nonexistent'
    )
    const result = await getUsersLoader(request)

    expect(result.users).toHaveLength(0)
    expect(result.totalCount).toBe(0)
  })

  it('handles multiple pages correctly', async () => {
    const mockResult = {
      data: [
        {
          id: 'u1',
          name: 'User 1',
          email: 'user1@example.com',
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'u2',
          name: 'User 2',
          email: 'user2@example.com',
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      pagination: {
        totalItems: 25,
        currentPage: 2,
        pageSize: 2,
        totalPages: 13,
      },
    }
    vi.mocked(userRepository.findManyPaginated).mockResolvedValue(mockResult)

    const request = new Request(
      'http://localhost/dashboard/users?page=2&pageSize=2'
    )
    const result = await getUsersLoader(request)

    expect(result.page).toBe(2)
    expect(result.pageSize).toBe(2)
    expect(result.totalCount).toBe(25)
    expect(result.totalPages).toBe(13)
  })
})

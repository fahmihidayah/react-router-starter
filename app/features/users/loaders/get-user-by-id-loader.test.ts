import { afterEach, describe, expect, it, vi } from 'vitest'
import type { LoaderArgs } from '~/lib/types'
import { getUserByIdLoader } from './get-user-by-id-loader'

vi.mock('../services', () => ({
  findById: vi.fn(),
}))

import * as userService from '../services'

function buildLoaderArgs(id: string): LoaderArgs {
  return {
    request: new Request(`http://localhost/admin/users/${id}`),
    context: new Map(),
    params: { id },
  }
}

describe('getUserByIdLoader', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns user when it exists', async () => {
    const mockUser = {
      id: 'u1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      roles: [],
    }
    vi.mocked(userService.findById).mockResolvedValue(mockUser)

    const result = await getUserByIdLoader(buildLoaderArgs('u1'))

    expect(result.data).toEqual(mockUser)
    expect(userService.findById).toHaveBeenCalledWith('u1')
  })

  it('returns a not-found response when user does not exist', async () => {
    vi.mocked(userService.findById).mockResolvedValue(undefined)
    const result = await getUserByIdLoader(buildLoaderArgs('nonexistent'))
    expect(result.success).toBe(false)
    expect(result.status).toBe(404)
  })

  it('calls service with the correct ID', async () => {
    const mockUser = {
      id: 'u42',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [],
    }
    vi.mocked(userService.findById).mockResolvedValue(mockUser)

    await getUserByIdLoader(buildLoaderArgs('u42'))

    expect(userService.findById).toHaveBeenCalledWith('u42')
    expect(userService.findById).toHaveBeenCalledTimes(1)
  })

  it('returns user with all fields intact including roles', async () => {
    const mockUser = {
      id: 'u1',
      name: 'Full User Data',
      email: 'full@example.com',
      emailVerified: true,
      image: 'https://example.com/avatar.jpg',
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-02-01'),
      roles: [
        {
          id: 'role-1',
          name: 'Admin',
          description: 'Administrator',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    }
    vi.mocked(userService.findById).mockResolvedValue(mockUser)

    const response = await getUserByIdLoader(buildLoaderArgs('u1'))
    const result = response.data
    if (!result) throw new Error('Expected user data')

    expect(result.id).toBe('u1')
    expect(result.name).toBe('Full User Data')
    expect(result.email).toBe('full@example.com')
    expect(result.emailVerified).toBe(true)
    expect(result.image).toBe('https://example.com/avatar.jpg')
    expect(result.roles).toHaveLength(1)
    expect(result.roles[0].name).toBe('Admin')
  })
})

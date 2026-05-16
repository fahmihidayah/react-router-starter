import { describe, it, expect, vi, afterEach } from 'vitest'
import { getUserByIdLoader } from './get-user-by-id-loader'

vi.mock('../repositories', () => ({
  userRepository: {
    findById: vi.fn(),
  },
}))

import { userRepository } from '../repositories'

describe('getUserByIdLoader', () => {
  afterEach(() => {
    vi.restoreAllMocks()
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
    }
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser)

    const result = await getUserByIdLoader('u1')

    expect(result).toEqual(mockUser)
    expect(userRepository.findById).toHaveBeenCalledWith('u1')
  })

  it('throws 404 response when user does not exist', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null)

    try {
      await getUserByIdLoader('nonexistent')
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(Response)
      expect((error as Response).status).toBe(404)
      expect(await (error as Response).text()).toBe('User not found')
    }
  })

  it('calls repository with the correct ID', async () => {
    const mockUser = {
      id: 'u42',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser)

    await getUserByIdLoader('u42')

    expect(userRepository.findById).toHaveBeenCalledWith('u42')
    expect(userRepository.findById).toHaveBeenCalledTimes(1)
  })

  it('returns user with all fields intact', async () => {
    const mockUser = {
      id: 'u1',
      name: 'Full User Data',
      email: 'full@example.com',
      emailVerified: true,
      image: 'https://example.com/avatar.jpg',
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-02-01'),
    }
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser)

    const result = await getUserByIdLoader('u1')

    expect(result.id).toBe('u1')
    expect(result.name).toBe('Full User Data')
    expect(result.email).toBe('full@example.com')
    expect(result.emailVerified).toBe(true)
    expect(result.image).toBe('https://example.com/avatar.jpg')
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createUserAction } from './create-user-action'

vi.mock('../repositories', () => ({
  userRepository: {
    create: vi.fn(),
  },
  accountRepository: {
    create: vi.fn(),
  },
}))

vi.mock('react-router', () => ({
  redirect: vi.fn((path: string) => ({ redirect: path })),
}))

import { redirect } from 'react-router'
import { accountRepository, userRepository } from '../repositories'

function buildFormRequest(data: Record<string, string>): Request {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return new Request('http://localhost/dashboard/users', {
    method: 'POST',
    body: formData,
  })
}

describe('createUserAction', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('creates a user and redirects on success', async () => {
    vi.mocked(userRepository.create).mockResolvedValue({
      id: 'u1',
      name: 'New User',
      email: 'newuser@example.com',
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.mocked(accountRepository.create).mockResolvedValue({
      id: 'acc1',
      accountId: 'newuser@example.com',
      providerId: 'credential',
      userId: 'u1',
      password: 'hashed',
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildFormRequest({
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
    })

    const result = await createUserAction(request)

    expect(redirect).toHaveBeenCalledWith('/dashboard/users')
    expect(result).toEqual({ redirect: '/dashboard/users' })
  })

  it('calls both repositories to create user and account', async () => {
    vi.mocked(userRepository.create).mockResolvedValue({
      id: 'u1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.mocked(accountRepository.create).mockResolvedValue({
      id: 'acc1',
      accountId: 'alice@example.com',
      providerId: 'credential',
      userId: 'u1',
      password: 'hashed',
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildFormRequest({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'secret123',
    })

    await createUserAction(request)

    expect(userRepository.create).toHaveBeenCalled()
    expect(accountRepository.create).toHaveBeenCalled()
  })

  it('returns error object when user creation fails', async () => {
    vi.mocked(userRepository.create).mockRejectedValue(new Error('DB error'))

    const request = buildFormRequest({
      name: 'Failed User',
      email: 'failed@example.com',
      password: 'password',
    })

    const result = await createUserAction(request)

    expect(result).toHaveProperty('error')
    expect((result as any).error).toContain('Failed to create user')
  })

  it('handles missing form fields gracefully', async () => {
    vi.mocked(userRepository.create).mockResolvedValue({
      id: 'u1',
      name: 'undefined',
      email: 'undefined',
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.mocked(accountRepository.create).mockResolvedValue({
      id: 'acc1',
      accountId: 'undefined',
      providerId: 'credential',
      userId: 'u1',
      password: 'undefined',
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new Request('http://localhost/dashboard/users', {
      method: 'POST',
      body: new FormData(),
    })

    await createUserAction(request)

    expect(redirect).toHaveBeenCalledWith('/dashboard/users')
  })

  it('passes correct user data to repository', async () => {
    vi.mocked(userRepository.create).mockResolvedValue({
      id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.mocked(accountRepository.create).mockResolvedValue({
      id: 'acc1',
      accountId: 'test@example.com',
      providerId: 'credential',
      userId: 'u1',
      password: 'hashed',
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildFormRequest({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpass123',
    })

    await createUserAction(request)

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: false,
      })
    )
  })

  it('passes correct account data to repository', async () => {
    vi.mocked(userRepository.create).mockResolvedValue({
      id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.mocked(accountRepository.create).mockResolvedValue({
      id: 'acc1',
      accountId: 'test@example.com',
      providerId: 'credential',
      userId: 'u1',
      password: 'hashed',
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildFormRequest({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpass123',
    })

    await createUserAction(request)

    expect(accountRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: 'test@example.com',
        providerId: 'credential',
        password: 'testpass123',
      })
    )
  })

  it('creates user with all required fields', async () => {
    vi.mocked(userRepository.create).mockResolvedValue({
      id: 'u1',
      name: 'Complete User',
      email: 'complete@example.com',
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.mocked(accountRepository.create).mockResolvedValue({
      id: 'acc1',
      accountId: 'complete@example.com',
      providerId: 'credential',
      userId: 'u1',
      password: 'hashed',
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildFormRequest({
      name: 'Complete User',
      email: 'complete@example.com',
      password: 'securepass123',
    })

    await createUserAction(request)

    expect(userRepository.create).toHaveBeenCalled()
    expect(accountRepository.create).toHaveBeenCalled()
  })
})

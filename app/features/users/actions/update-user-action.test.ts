import { describe, it, expect, vi, afterEach } from 'vitest'
import { updateUserAction } from './update-user-action'

vi.mock('../repositories', () => ({
  userRepository: {
    update: vi.fn(),
  },
}))

vi.mock('react-router', () => ({
  redirect: vi.fn((path: string) => ({ redirect: path })),
}))

import { userRepository } from '../repositories'
import { redirect } from 'react-router'

function buildFormRequest(data: Record<string, string>): Request {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => formData.append(key, value))
  return new Request('http://localhost/dashboard/users/u1', {
    method: 'POST',
    body: formData,
  })
}

describe('updateUserAction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('updates a user and redirects on success', async () => {
    vi.mocked(userRepository.update).mockResolvedValue({
      id: 'u1',
      name: 'Updated Name',
      email: 'updated@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildFormRequest({
      name: 'Updated Name',
      email: 'updated@example.com',
    })

    const result = await updateUserAction(request, 'u1')

    expect(redirect).toHaveBeenCalledWith('/dashboard/users')
    expect(result).toEqual({ redirect: '/dashboard/users' })
  })

  it('calls repository with correct ID and data', async () => {
    vi.mocked(userRepository.update).mockResolvedValue({
      id: 'u1',
      name: 'New Name',
      email: 'new@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildFormRequest({
      name: 'New Name',
      email: 'new@example.com',
    })

    await updateUserAction(request, 'u1')

    expect(userRepository.update).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({
        name: 'New Name',
        email: 'new@example.com',
      })
    )
  })

  it('includes updatedAt timestamp in update', async () => {
    const beforeTime = new Date()
    vi.mocked(userRepository.update).mockResolvedValue({
      id: 'u1',
      name: 'Updated',
      email: 'updated@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildFormRequest({
      name: 'Updated',
      email: 'updated@example.com',
    })

    await updateUserAction(request, 'u1')

    const callArgs = vi.mocked(userRepository.update).mock.calls[0]
    expect(callArgs[1]).toHaveProperty('updatedAt')
    const updatedAt = (callArgs[1] as any).updatedAt
    expect(updatedAt).toBeInstanceOf(Date)
    expect(updatedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
  })

  it('returns error when repository throws', async () => {
    vi.mocked(userRepository.update).mockRejectedValue(
      new Error('DB error')
    )

    const request = buildFormRequest({
      name: 'Failed Update',
      email: 'failed@example.com',
    })

    const result = await updateUserAction(request, 'u1')

    expect(result).toHaveProperty('error')
    expect((result as any).error).toContain('Failed to update user')
  })

  it('updates only provided fields', async () => {
    vi.mocked(userRepository.update).mockResolvedValue({
      id: 'u1',
      name: 'Only Name',
      email: 'original@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildFormRequest({
      name: 'Only Name',
      email: 'original@example.com',
    })

    await updateUserAction(request, 'u1')

    expect(userRepository.update).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({
        name: 'Only Name',
      })
    )
  })

  it('handles empty form data gracefully', async () => {
    vi.mocked(userRepository.update).mockResolvedValue({
      id: 'u1',
      name: undefined,
      email: undefined,
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new Request('http://localhost/dashboard/users/u1', {
      method: 'POST',
      body: new FormData(),
    })

    const result = await updateUserAction(request, 'u1')

    expect(result).toHaveProperty('error')
  })

  it('passes correct user ID to repository', async () => {
    vi.mocked(userRepository.update).mockResolvedValue({
      id: 'u999',
      name: 'Test',
      email: 'test@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildFormRequest({
      name: 'Test',
      email: 'test@example.com',
    })

    await updateUserAction(request, 'u999')

    expect(userRepository.update).toHaveBeenCalledWith(
      'u999',
      expect.anything()
    )
  })
})

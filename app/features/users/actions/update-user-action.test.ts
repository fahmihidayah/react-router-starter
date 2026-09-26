import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ActionArgs } from '~/lib/types'
import { updateUserAction } from './update-user-action'

vi.mock('../services', () => ({
  update: vi.fn(),
}))

vi.mock('react-router', () => ({
  redirect: vi.fn((path: string) => ({ redirect: path })),
}))

import { redirect } from 'react-router'
import * as userService from '../services'

function buildFormRequest(data: Record<string, string>): Request {
  const formData = new FormData()
  Object.entries(data).map(([key, value]) => formData.append(key, value))
  return new Request('http://localhost/admin/users/u1', {
    method: 'POST',
    body: formData,
  })
}

function buildActionArgs(request: Request, id: string): ActionArgs {
  return {
    request,
    context: new Map(),
    params: { id },
  }
}

describe('updateUserAction', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('updates a user and redirects on success', async () => {
    vi.mocked(userService.update).mockResolvedValue(undefined)

    const request = buildFormRequest({
      name: 'Updated Name',
      email: 'updated@example.com',
    })

    const result = await updateUserAction(buildActionArgs(request, 'u1'))

    expect(redirect).toHaveBeenCalledWith('/admin/users')
    expect(result).toEqual({ redirect: '/admin/users' })
  })

  it('calls service with correct ID and data', async () => {
    vi.mocked(userService.update).mockResolvedValue(undefined)

    const request = buildFormRequest({
      name: 'New Name',
      email: 'new@example.com',
    })

    await updateUserAction(buildActionArgs(request, 'u1'))

    expect(userService.update).toHaveBeenCalledWith('u1', {
      name: 'New Name',
      email: 'new@example.com',
    })
  })

  it('throws Response when user not found', async () => {
    const { UserNotFoundError } = await import('../types/errors/user-errors')
    vi.mocked(userService.update).mockRejectedValue(
      new UserNotFoundError('User not found')
    )

    const request = buildFormRequest({
      name: 'Failed Update',
      email: 'failed@example.com',
    })

    try {
      await updateUserAction(buildActionArgs(request, 'u1'))
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(Response)
      expect((error as Response).status).toBe(404)
    }
  })

  it('returns validation errors for invalid form data', async () => {
    const request = buildFormRequest({
      name: '',
      email: 'invalid-email',
    })

    const result = await updateUserAction(buildActionArgs(request, 'u1'))

    expect(result).toHaveProperty('errors')
  })

  it('handles email already in use error', async () => {
    const { EmailAlreadyExistsError } = await import('../types/errors/user-errors')
    vi.mocked(userService.update).mockRejectedValue(
      new EmailAlreadyExistsError('Email already in use')
    )

    const request = buildFormRequest({
      name: 'Test User',
      email: 'taken@example.com',
    })

    const result = await updateUserAction(buildActionArgs(request, 'u1'))

    expect(result).toHaveProperty('errors')
    expect((result as any).errors.email).toContain('Email already in use')
  })
})

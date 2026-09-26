import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ActionArgs } from '~/lib/types'
import { createUserAction } from './create-user-action'

vi.mock('../services', () => ({
  create: vi.fn(),
}))

vi.mock('react-router', () => ({
  redirect: vi.fn((path: string) => ({ redirect: path })),
}))

import * as userService from '../services'

function buildFormRequest(data: Record<string, string>): Request {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return new Request('http://localhost/admin/users', {
    method: 'POST',
    body: formData,
  })
}

function buildActionArgs(request: Request): ActionArgs {
  return {
    request,
    context: new Map(),
    params: {},
  }
}

describe('createUserAction', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('creates a user successfully', async () => {
    vi.mocked(userService.create).mockResolvedValue({
      userId: 'u1',
      setCookie: null,
    })

    const request = buildFormRequest({
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
    })

    const result = await createUserAction(buildActionArgs(request))

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data?.userId).toBe('u1')
      expect(result.data?.setCookie).toBe(null)
    }
  })

  it('calls user service to create user', async () => {
    vi.mocked(userService.create).mockResolvedValue({
      userId: 'u1',
      setCookie: null,
    })

    const request = buildFormRequest({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'secret123',
    })

    await createUserAction(buildActionArgs(request))

    expect(userService.create).toHaveBeenCalledWith({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'secret123',
    })
  })

  it('returns error object when email already exists', async () => {
    const { EmailAlreadyExistsError } = await import('../types/errors/user-errors')
    vi.mocked(userService.create).mockRejectedValue(
      new EmailAlreadyExistsError('An account with this email already exists'),
    )

    const request = buildFormRequest({
      name: 'Failed User',
      email: 'failed@example.com',
      password: 'password',
    })

    const result = await createUserAction(buildActionArgs(request))

    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error as Record<string, string[]>
      expect(errors.email).toContain('An account with this email already exists')
    }
  })

  it('returns validation errors for invalid form data', async () => {
    const request = buildFormRequest({
      name: '',
      email: 'invalid-email',
      password: '123',
    })

    const result = await createUserAction(buildActionArgs(request))

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeDefined()
    }
  })

  it('handles server errors gracefully', async () => {
    const { UserCreationFailedError } = await import('../types/errors/user-errors')
    vi.mocked(userService.create).mockRejectedValue(
      new UserCreationFailedError('Server error. Please try again later'),
    )

    const request = buildFormRequest({
      name: 'Error User',
      email: 'error@example.com',
      password: 'testpass123',
    })

    const result = await createUserAction(buildActionArgs(request))

    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error as Record<string, string[]>
      expect(errors.name[0]).toContain('Server error')
    }
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ActionArgs } from '~/lib/types'
import { registerUserAction } from './register-user-action'

vi.mock('../services', () => ({
  register: vi.fn(),
}))

import * as userService from '../services'

function buildFormRequest(data: Record<string, string>): Request {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return new Request('http://localhost/register', {
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

const validInput = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
}

describe('registerUserAction', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns success when registration succeeds', async () => {
    vi.mocked(userService.register).mockResolvedValue({
      userId: 'u1',
      setCookie: 'session=abc123',
    })

    const result = await registerUserAction(buildActionArgs(buildFormRequest(validInput)))

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.setCookie).toBe('session=abc123')
    }
  })

  it('calls userService.register with parsed form data', async () => {
    vi.mocked(userService.register).mockResolvedValue({
      userId: 'u1',
      setCookie: null,
    })

    await registerUserAction(buildActionArgs(buildFormRequest(validInput)))

    expect(userService.register).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    })
  })

  it('returns validation error when form data is invalid', async () => {
    const invalidInput = {
      name: '',
      email: 'invalid-email',
      password: '123',
    }

    const result = await registerUserAction(buildActionArgs(buildFormRequest(invalidInput)))

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(400)
      expect(result.error).toBeTruthy()
    }
  })

  it('returns error when email already exists', async () => {
    const error = new Error('An account with this email already exists')
    ;(error as any).status = 409
    vi.mocked(userService.register).mockRejectedValue(error)

    const result = await registerUserAction(buildActionArgs(buildFormRequest(validInput)))

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(409)
      expect(result.error).toContain('already exists')
    }
  })

  it('returns error when server error occurs', async () => {
    const error = new Error('Server error. Please try again later')
    ;(error as any).status = 500
    vi.mocked(userService.register).mockRejectedValue(error)

    const result = await registerUserAction(buildActionArgs(buildFormRequest(validInput)))

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(500)
      expect(result.error).toContain('Server error')
    }
  })

  it('handles missing name field', async () => {
    const incompleteInput = {
      name: '',
      email: 'test@example.com',
      password: 'password123',
    }

    const result = await registerUserAction(buildActionArgs(buildFormRequest(incompleteInput)))

    expect(result.success).toBe(false)
  })

  it('handles missing email field', async () => {
    const incompleteInput = {
      name: 'Test User',
      email: '',
      password: 'password123',
    }

    const result = await registerUserAction(buildActionArgs(buildFormRequest(incompleteInput)))

    expect(result.success).toBe(false)
  })

  it('handles short password', async () => {
    const weakPasswordInput = {
      name: 'Test User',
      email: 'test@example.com',
      password: '123',
    }

    const result = await registerUserAction(buildActionArgs(buildFormRequest(weakPasswordInput)))

    expect(result.success).toBe(false)
  })
})

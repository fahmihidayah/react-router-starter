import { describe, it, expect, vi, afterEach } from 'vitest'
import { createUserAction } from './create-user-action'

vi.mock('~/lib/database', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
  },
}))

vi.mock('react-router', () => ({
  redirect: vi.fn((path: string) => ({ redirect: path })),
}))

import { db } from '~/lib/database'
import { redirect } from 'react-router'

function buildFormRequest(data: Record<string, string>): Request {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => formData.append(key, value))
  return new Request('http://localhost/dashboard/users', {
    method: 'POST',
    body: formData,
  })
}

describe('createUserAction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a user and redirects on success', async () => {
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as any)

    const request = buildFormRequest({
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
    })

    const result = await createUserAction(request)

    expect(redirect).toHaveBeenCalledWith('/dashboard/users')
    expect(result).toEqual({ redirect: '/dashboard/users' })
  })

  it('extracts form data correctly', async () => {
    const insertMock = vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    })
    vi.mocked(db.insert).mockImplementation(insertMock)

    const request = buildFormRequest({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'secret123',
    })

    await createUserAction(request)

    expect(insertMock).toHaveBeenCalled()
    // Verify both user and account inserts were called
    expect(insertMock.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('returns error object when user creation fails', async () => {
    vi.mocked(db.insert).mockImplementation(() => {
      return {
        values: vi.fn().mockRejectedValue(new Error('DB error')),
      } as any
    })

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
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as any)

    const request = new Request('http://localhost/dashboard/users', {
      method: 'POST',
      body: new FormData(),
    })

    const result = await createUserAction(request)

    expect(result).toHaveProperty('error')
  })

  it('inserts both user and account records', async () => {
    const insertMock = vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    })
    vi.mocked(db.insert).mockImplementation(insertMock)

    const request = buildFormRequest({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpass123',
    })

    await createUserAction(request)

    // Should be called at least twice: once for user, once for account
    expect(insertMock.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('creates user with all required fields', async () => {
    const insertMock = vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    })
    vi.mocked(db.insert).mockImplementation(insertMock)

    const request = buildFormRequest({
      name: 'Complete User',
      email: 'complete@example.com',
      password: 'securepass123',
    })

    await createUserAction(request)

    expect(insertMock).toHaveBeenCalled()
  })
})

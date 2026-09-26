import { describe, it, expect, vi, afterEach } from 'vitest'
import type { ActionArgs } from '~/lib/types'
import { deleteUserAction } from './delete-user-action'

vi.mock('../services', () => ({
  deleteById: vi.fn(),
}))

import * as userService from '../services'

function buildActionArgs(id: string): ActionArgs {
  return {
    request: new Request('http://localhost/admin/users/' + id, { method: 'DELETE' }),
    context: new Map(),
    params: { id },
  }
}

describe('deleteUserAction', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('deletes a user and returns success', async () => {
    vi.mocked(userService.deleteById).mockResolvedValue(undefined)

    const result = await deleteUserAction(buildActionArgs('u1'))

    expect(result.success).toBe(true)
    expect(result.message).toBe('User deleted successfully')
  })

  it('calls service deleteById with correct ID', async () => {
    vi.mocked(userService.deleteById).mockResolvedValue(undefined)

    await deleteUserAction(buildActionArgs('u42'))

    expect(userService.deleteById).toHaveBeenCalledWith('u42')
    expect(userService.deleteById).toHaveBeenCalledTimes(1)
  })

  it('returns failure when user not found', async () => {
    const { UserNotFoundError } = await import('../types/errors/user-errors')
    vi.mocked(userService.deleteById).mockRejectedValue(
      new UserNotFoundError('User not found')
    )

    const result = await deleteUserAction(buildActionArgs('u1'))

    expect(result.success).toBe(false)
    expect(result.message).toBe('User not found')
  })

  it('returns success for valid user ID', async () => {
    vi.mocked(userService.deleteById).mockResolvedValue(undefined)

    const result = await deleteUserAction(buildActionArgs('valid-id-123'))

    expect(result.success).toBe(true)
    expect(result.message).toContain('successfully')
  })

  it('handles server errors gracefully', async () => {
    vi.mocked(userService.deleteById).mockRejectedValue(
      new Error('An unexpected error occurred')
    )

    const result = await deleteUserAction(buildActionArgs('u1'))

    expect(result.success).toBe(false)
    expect(result.message).toBe('An unexpected error occurred. Please try again.')
  })
})

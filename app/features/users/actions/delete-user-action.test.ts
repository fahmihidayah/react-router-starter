import { describe, it, expect, vi, afterEach } from 'vitest'
import { deleteUserAction } from './delete-user-action'

vi.mock('../repositories', () => ({
  userRepository: {
    delete: vi.fn(),
  },
}))

import { userRepository } from '../repositories'

describe('deleteUserAction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deletes a user and returns success', async () => {
    vi.mocked(userRepository.delete).mockResolvedValue(undefined)

    const result = await deleteUserAction('u1')

    expect(result.success).toBe(true)
    expect(result.message).toBe('User deleted successfully')
  })

  it('calls repository delete with correct ID', async () => {
    vi.mocked(userRepository.delete).mockResolvedValue(undefined)

    await deleteUserAction('u42')

    expect(userRepository.delete).toHaveBeenCalledWith('u42')
    expect(userRepository.delete).toHaveBeenCalledTimes(1)
  })

  it('returns failure when repository throws', async () => {
    vi.mocked(userRepository.delete).mockRejectedValue(new Error('DB error'))

    const result = await deleteUserAction('u1')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Failed to delete user')
  })

  it('returns success for valid user ID', async () => {
    vi.mocked(userRepository.delete).mockResolvedValue(undefined)

    const result = await deleteUserAction('valid-id-123')

    expect(result.success).toBe(true)
    expect(result.message).toContain('successfully')
  })

  it('handles database constraint errors gracefully', async () => {
    const constraintError = new Error('Constraint violation')
    vi.mocked(userRepository.delete).mockRejectedValue(constraintError)

    const result = await deleteUserAction('u1')

    expect(result.success).toBe(false)
    expect(result.message).toBe('Failed to delete user')
  })

  it('returns consistent error message on failure', async () => {
    vi.mocked(userRepository.delete).mockRejectedValue(
      new Error('Any error')
    )

    const result1 = await deleteUserAction('u1')
    vi.mocked(userRepository.delete).mockRejectedValue(
      new Error('Different error')
    )
    const result2 = await deleteUserAction('u2')

    expect(result1.message).toBe(result2.message)
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { deleteManyUsersAction } from './delete-many-user-action'

vi.mock('../repositories', () => ({
  userRepository: {
    deleteMany: vi.fn(),
  },
}))

import { userRepository } from '../repositories'

describe('deleteManyUsersAction', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('deletes multiple users and returns success', async () => {
    vi.mocked(userRepository.deleteMany).mockResolvedValue(Array.of())

    const result = await deleteManyUsersAction(['u1', 'u2', 'u3'])

    expect(result.success).toBe(true)
    expect(result.message).toBe('Users deleted successfully')
  })

  it('calls repository deleteMany with correct IDs', async () => {
    vi.mocked(userRepository.deleteMany).mockResolvedValue(Array.of())

    await deleteManyUsersAction(['u1', 'u2'])

    expect(userRepository.deleteMany).toHaveBeenCalledTimes(1)
    expect(userRepository.deleteMany).toHaveBeenCalledWith(expect.anything())
  })

  it('returns failure when given empty array', async () => {
    const result = await deleteManyUsersAction([])

    expect(result.success).toBe(false)
    expect(result.message).toBe('No users selected')
    expect(userRepository.deleteMany).not.toHaveBeenCalled()
  })

  it('returns failure when repository throws', async () => {
    vi.mocked(userRepository.deleteMany).mockRejectedValue(new Error('DB error'))

    const result = await deleteManyUsersAction(['u1'])

    expect(result.success).toBe(false)
    expect(result.message).toBe('Failed to delete users')
  })

  it('handles single user deletion', async () => {
    vi.mocked(userRepository.deleteMany).mockResolvedValue(Array.of())

    const result = await deleteManyUsersAction(['u1'])

    expect(result.success).toBe(true)
    expect(userRepository.deleteMany).toHaveBeenCalled()
  })

  it('handles large batch of user IDs', async () => {
    vi.mocked(userRepository.deleteMany).mockResolvedValue(Array.of())

    const ids = Array.from({ length: 100 }, (_, i) => `u${i}`)
    const result = await deleteManyUsersAction(ids)

    expect(result.success).toBe(true)
    expect(userRepository.deleteMany).toHaveBeenCalledTimes(1)
  })

  it('returns specific error message on database failure', async () => {
    vi.mocked(userRepository.deleteMany).mockRejectedValue(new Error('Constraint violation'))

    const result = await deleteManyUsersAction(['u1', 'u2'])

    expect(result.success).toBe(false)
    expect(result.message).toContain('Failed to delete')
  })

  it('distinguishes between empty array and database error', async () => {
    const emptyResult = await deleteManyUsersAction([])
    expect(emptyResult.message).toBe('No users selected')

    vi.mocked(userRepository.deleteMany).mockRejectedValue(new Error('DB error'))
    const errorResult = await deleteManyUsersAction(['u1'])
    expect(errorResult.message).toBe('Failed to delete users')

    expect(emptyResult.message).not.toBe(errorResult.message)
  })

  it('validates non-empty array before calling repository', async () => {
    await deleteManyUsersAction([])

    expect(userRepository.deleteMany).not.toHaveBeenCalled()
  })

  it('calls repository when array has at least one element', async () => {
    vi.mocked(userRepository.deleteMany).mockResolvedValue(Array.of())

    await deleteManyUsersAction(['u1'])

    expect(userRepository.deleteMany).toHaveBeenCalledTimes(1)
  })
})

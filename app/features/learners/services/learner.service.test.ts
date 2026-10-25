import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as queries from '../queries'
import * as service from './learner.service'

vi.mock('../queries', () => ({
  findAllForUser: vi.fn(),
  findAllContributableForUser: vi.fn(),
  findByIdForUser: vi.fn(),
  findByIdOwned: vi.fn(),
  findMembership: vi.fn(),
  findAccessUsers: vi.fn(),
  findGroupsForUser: vi.fn(),
  findAllWithMembershipForUser: vi.fn(),
  findGroupByName: vi.fn(),
  createGroup: vi.fn(),
  renameGroup: vi.fn(),
  deleteGroup: vi.fn(),
  moveLearnerToGroup: vi.fn(),
  createForUser: vi.fn(),
  updateForUser: vi.fn(),
  deleteForUser: vi.fn(),
  addAccessByEmail: vi.fn(),
}))

const now = new Date('2026-10-04T00:00:00.000Z')

describe('learner organization service', () => {
  beforeEach(() => vi.resetAllMocks())

  it('organizes only the current user membership into personal groups', async () => {
    vi.mocked(queries.findGroupsForUser).mockResolvedValue([
      {
        id: 'group-1',
        ownerUserId: 'user-1',
        name: 'Class A',
        position: 0,
        createdAt: now,
        updatedAt: now,
      },
    ])
    vi.mocked(queries.findAllWithMembershipForUser).mockResolvedValue([
      {
        id: 'learner-1',
        name: 'Alya',
        avatar: null,
        dateOfBirth: null,
        createdAt: now,
        updatedAt: now,
        groupId: 'group-1',
        role: 'teacher',
      },
      {
        id: 'learner-2',
        name: 'Bima',
        avatar: null,
        dateOfBirth: null,
        createdAt: now,
        updatedAt: now,
        groupId: null,
        role: 'owner',
      },
    ])

    const result = await service.findOrganizedForUser('user-1')
    expect(result.groups[0].learners.map((learner) => learner.id)).toEqual(['learner-1'])
    expect(result.ungrouped.map((learner) => learner.id)).toEqual(['learner-2'])
  })

  it('allows a teacher to open a shared learner without exposing the access list', async () => {
    vi.mocked(queries.findByIdForUser).mockResolvedValue({ id: 'learner-1' } as never)
    vi.mocked(queries.findMembership).mockResolvedValue({ role: 'teacher' } as never)

    await expect(service.getDetailForUser('learner-1', 'teacher-1')).resolves.toMatchObject({
      memberRole: 'teacher',
      accessUsers: [],
    })
    expect(queries.findAccessUsers).not.toHaveBeenCalled()
  })

  it('keeps access management owner-only', async () => {
    vi.mocked(queries.findByIdOwned).mockResolvedValue(undefined)
    await expect(
      service.addAccessForUser('learner-1', 'teacher-1', {
        email: 'parent@example.com',
        role: 'parent',
      }),
    ).resolves.toBe('learner-not-found')
    expect(queries.addAccessByEmail).not.toHaveBeenCalled()
  })
})

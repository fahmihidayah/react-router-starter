import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addAccessByEmail,
  canContribute,
  createForUser,
  createGroup,
  deleteForUser,
  deleteGroup,
  findAccessUsers,
  findAllContributableForUser,
  findAllForUser,
  findAllWithMembershipForUser,
  findByIdForUser,
  findByIdOwned,
  findGroupByName,
  findGroupsForUser,
  findMembership,
  moveLearnerToGroup,
  renameGroup,
  updateForUser,
} from './index'
import * as schema from '~/db/schema'
import { db } from '~/lib/database'

vi.mock('~/lib/database', () => ({
  db: {
    transaction: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
    query: {
      learnerMembers: {
        findFirst: vi.fn(),
      },
      learnerGroups: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
  },
}))

describe('learners queries', () => {
  const mockUserId = 'user-1'
  const mockLearnerId = 'learner-1'
  const mockGroupId = 'group-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createForUser', () => {
    it('should create a learner and associate with user as owner', async () => {
      const mockLearner = {
        id: mockLearnerId,
        name: 'Test Learner',
        avatar: null,
        dateOfBirth: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const insertData = {
        id: mockLearnerId,
        name: 'Test Learner',
        avatar: null,
        dateOfBirth: null,
      }

      const mockReturning = vi.fn().mockResolvedValue([mockLearner])
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues })

      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        const mockTx = {
          insert: mockInsert,
        }
        return await callback(mockTx as any)
      })

      const result = await createForUser(insertData, mockUserId)

      expect(result).toEqual(mockLearner)
      expect(db.transaction).toHaveBeenCalledTimes(1)
      expect(mockInsert).toHaveBeenCalledTimes(2) // learner + learnerMember
    })
  })

  describe('findAllForUser', () => {
    it('should return all learners for a user with active access', async () => {
      const mockLearners = [
        {
          id: 'l1',
          name: 'Learner 1',
          avatar: null,
          dateOfBirth: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'l2',
          name: 'Learner 2',
          avatar: null,
          dateOfBirth: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const mockOrderBy = vi.fn().mockResolvedValue(mockLearners.map((l) => ({ learner: l })))
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findAllForUser(mockUserId)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(mockLearners[0])
    })

    it('should return empty array when no learners found', async () => {
      const mockOrderBy = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findAllForUser(mockUserId)

      expect(result).toEqual([])
    })
  })

  describe('findAllContributableForUser', () => {
    it('should return learners where user has contributor role', async () => {
      const mockLearners = [
        {
          id: 'l1',
          name: 'Learner 1',
          avatar: null,
          dateOfBirth: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const mockOrderBy = vi.fn().mockResolvedValue(mockLearners.map((l) => ({ learner: l })))
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findAllContributableForUser(mockUserId)

      expect(result).toHaveLength(1)
    })
  })

  describe('findAllWithMembershipForUser', () => {
    it('should return learners with membership details', async () => {
      const mockData = [
        {
          learner: {
            id: 'l1',
            name: 'Learner 1',
            avatar: null,
            dateOfBirth: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          groupId: 'g1',
          role: 'owner' as const,
        },
      ]

      const mockOrderBy = vi.fn().mockResolvedValue(mockData)
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findAllWithMembershipForUser(mockUserId)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('groupId', 'g1')
      expect(result[0]).toHaveProperty('role', 'owner')
    })
  })

  describe('findByIdForUser', () => {
    it('should return learner when user has access', async () => {
      const mockLearner = {
        id: mockLearnerId,
        name: 'Test Learner',
        avatar: null,
        dateOfBirth: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockLimit = vi.fn().mockResolvedValue([{ learner: mockLearner }])
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findByIdForUser(mockLearnerId, mockUserId)

      expect(result).toEqual(mockLearner)
    })

    it('should return undefined when learner not found or no access', async () => {
      const mockLimit = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findByIdForUser(mockLearnerId, mockUserId)

      expect(result).toBeUndefined()
    })
  })

  describe('findByIdOwned', () => {
    it('should return learner when user is owner', async () => {
      const mockLearner = {
        id: mockLearnerId,
        name: 'Test Learner',
        avatar: null,
        dateOfBirth: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockLimit = vi.fn().mockResolvedValue([{ learner: mockLearner }])
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findByIdOwned(mockLearnerId, mockUserId)

      expect(result).toEqual(mockLearner)
    })

    it('should return undefined when user is not owner', async () => {
      const mockLimit = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findByIdOwned(mockLearnerId, mockUserId)

      expect(result).toBeUndefined()
    })
  })

  describe('findMembership', () => {
    it('should return active membership', async () => {
      const mockMembership = {
        id: 'm1',
        learnerId: mockLearnerId,
        userId: mockUserId,
        role: 'owner' as const,
        status: 'active' as const,
        groupId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(db.query.learnerMembers.findFirst).mockResolvedValue(mockMembership)

      const result = await findMembership(mockLearnerId, mockUserId)

      expect(result).toEqual(mockMembership)
    })

    it('should return undefined when no membership found', async () => {
      vi.mocked(db.query.learnerMembers.findFirst).mockResolvedValue(undefined)

      const result = await findMembership(mockLearnerId, mockUserId)

      expect(result).toBeUndefined()
    })
  })

  describe('canContribute', () => {
    it('should return true for owner role', async () => {
      const mockMembership = {
        id: 'm1',
        learnerId: mockLearnerId,
        userId: mockUserId,
        role: 'owner' as const,
        status: 'active' as const,
        groupId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(db.query.learnerMembers.findFirst).mockResolvedValue(mockMembership)

      const result = await canContribute(mockLearnerId, mockUserId)

      expect(result).toBe(true)
    })

    it('should return true for teacher role', async () => {
      const mockMembership = {
        id: 'm1',
        learnerId: mockLearnerId,
        userId: mockUserId,
        role: 'teacher' as const,
        status: 'active' as const,
        groupId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(db.query.learnerMembers.findFirst).mockResolvedValue(mockMembership)

      const result = await canContribute(mockLearnerId, mockUserId)

      expect(result).toBe(true)
    })

    it('should return false for viewer role', async () => {
      const mockMembership = {
        id: 'm1',
        learnerId: mockLearnerId,
        userId: mockUserId,
        role: 'viewer' as const,
        status: 'active' as const,
        groupId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(db.query.learnerMembers.findFirst).mockResolvedValue(mockMembership)

      const result = await canContribute(mockLearnerId, mockUserId)

      expect(result).toBe(false)
    })

    it('should return false when no membership found', async () => {
      vi.mocked(db.query.learnerMembers.findFirst).mockResolvedValue(undefined)

      const result = await canContribute(mockLearnerId, mockUserId)

      expect(result).toBe(false)
    })
  })

  describe('findGroupsForUser', () => {
    it('should return user groups ordered by position and name', async () => {
      const mockGroups = [
        {
          id: 'g1',
          name: 'Group 1',
          position: 0,
          ownerUserId: mockUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'g2',
          name: 'Group 2',
          position: 1,
          ownerUserId: mockUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(db.query.learnerGroups.findMany).mockResolvedValue(mockGroups)

      const result = await findGroupsForUser(mockUserId)

      expect(result).toEqual(mockGroups)
    })
  })

  describe('findGroupByName', () => {
    it('should return group when found', async () => {
      const mockGroup = {
        id: mockGroupId,
        name: 'Test Group',
        position: 0,
        ownerUserId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockLimit = vi.fn().mockResolvedValue([mockGroup])
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findGroupByName(mockUserId, 'Test Group')

      expect(result).toEqual(mockGroup)
    })

    it('should return undefined when group not found', async () => {
      const mockLimit = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findGroupByName(mockUserId, 'Nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('createGroup', () => {
    it('should create and return a group', async () => {
      const mockGroup = {
        id: mockGroupId,
        name: 'New Group',
        position: 0,
        ownerUserId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockReturning = vi.fn().mockResolvedValue([mockGroup])
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues })
      vi.mocked(db.insert).mockReturnValue(mockInsert() as any)

      const result = await createGroup({
        id: mockGroupId,
        name: 'New Group',
        position: 0,
        ownerUserId: mockUserId,
      })

      expect(result).toEqual(mockGroup)
    })
  })

  describe('renameGroup', () => {
    it('should rename group and return updated group', async () => {
      const mockGroup = {
        id: mockGroupId,
        name: 'Renamed Group',
        position: 0,
        ownerUserId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockReturning = vi.fn().mockResolvedValue([mockGroup])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })
      vi.mocked(db.update).mockReturnValue(mockUpdate() as any)

      const result = await renameGroup(mockGroupId, mockUserId, 'Renamed Group')

      expect(result).toEqual(mockGroup)
    })

    it('should return undefined when group not found or not owned', async () => {
      const mockReturning = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })
      vi.mocked(db.update).mockReturnValue(mockUpdate() as any)

      const result = await renameGroup(mockGroupId, mockUserId, 'Renamed Group')

      expect(result).toBeUndefined()
    })
  })

  describe('deleteGroup', () => {
    it('should delete group and return true', async () => {
      const mockReturning = vi.fn().mockResolvedValue([{ id: mockGroupId }])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere })
      vi.mocked(db.delete).mockReturnValue(mockDelete() as any)

      const result = await deleteGroup(mockGroupId, mockUserId)

      expect(result).toBe(true)
    })

    it('should return false when group not found or not owned', async () => {
      const mockReturning = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere })
      vi.mocked(db.delete).mockReturnValue(mockDelete() as any)

      const result = await deleteGroup(mockGroupId, mockUserId)

      expect(result).toBe(false)
    })
  })

  describe('moveLearnerToGroup', () => {
    it('should move learner to valid group', async () => {
      vi.mocked(db.query.learnerGroups.findFirst).mockResolvedValue({
        id: mockGroupId,
        name: 'Group',
        position: 0,
        ownerUserId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const mockReturning = vi.fn().mockResolvedValue([{ id: 'm1' }])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })
      vi.mocked(db.update).mockReturnValue(mockUpdate() as any)

      const result = await moveLearnerToGroup(mockLearnerId, mockUserId, mockGroupId)

      expect(result).toBe(true)
    })

    it('should return false when group not found', async () => {
      vi.mocked(db.query.learnerGroups.findFirst).mockResolvedValue(undefined)

      const result = await moveLearnerToGroup(mockLearnerId, mockUserId, mockGroupId)

      expect(result).toBe(false)
    })

    it('should move learner to ungrouped when groupId is null', async () => {
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'm1' }])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })
      vi.mocked(db.update).mockReturnValue(mockUpdate() as any)

      const result = await moveLearnerToGroup(mockLearnerId, mockUserId, null)

      expect(result).toBe(true)
    })
  })

  describe('findAccessUsers', () => {
    it('should return list of users with access to learner', async () => {
      const mockUsers = [
        {
          id: 'u1',
          name: 'User 1',
          email: 'user1@test.com',
          image: null,
          role: 'owner' as const,
          status: 'active' as const,
        },
      ]

      const mockOrderBy = vi.fn().mockResolvedValue(mockUsers)
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findAccessUsers(mockLearnerId)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('role', 'owner')
    })
  })

  describe('addAccessByEmail', () => {
    it('should return user-not-found when email does not exist', async () => {
      const mockLimit = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await addAccessByEmail(mockLearnerId, 'nonexistent@test.com', 'parent')

      expect(result).toBe('user-not-found')
    })

    it('should return already-exists when active membership exists', async () => {
      const mockUserLimit = vi.fn().mockResolvedValue([{ id: 'u1' }])
      const mockUserWhere = vi.fn().mockReturnValue({ limit: mockUserLimit })
      const mockUserFrom = vi.fn().mockReturnValue({ where: mockUserWhere })
      const mockUserSelect = vi.fn().mockReturnValue({ from: mockUserFrom })

      const mockMemberLimit = vi.fn().mockResolvedValue([{ id: 'm1', status: 'active' }])
      const mockMemberWhere = vi.fn().mockReturnValue({ limit: mockMemberLimit })
      const mockMemberFrom = vi.fn().mockReturnValue({ where: mockMemberWhere })
      const mockMemberSelect = vi.fn().mockReturnValue({ from: mockMemberFrom })

      vi.mocked(db.select)
        .mockReturnValueOnce(mockUserSelect() as any)
        .mockReturnValueOnce(mockMemberSelect() as any)

      const result = await addAccessByEmail(mockLearnerId, 'existing@test.com', 'parent')

      expect(result).toBe('already-exists')
    })
  })

  describe('updateForUser', () => {
    it('should update learner when user is owner', async () => {
      const mockLearner = {
        id: mockLearnerId,
        name: 'Updated Name',
        avatar: 'avatar.jpg',
        dateOfBirth: new Date('2020-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Mock findByIdOwned
      const mockLimitOwned = vi.fn().mockResolvedValue([{ learner: mockLearner }])
      const mockWhereOwned = vi.fn().mockReturnValue({ limit: mockLimitOwned })
      const mockInnerJoinOwned = vi.fn().mockReturnValue({ where: mockWhereOwned })
      const mockFromOwned = vi.fn().mockReturnValue({ innerJoin: mockInnerJoinOwned })
      const mockSelectOwned = vi.fn().mockReturnValue({ from: mockFromOwned })
      vi.mocked(db.select).mockReturnValue(mockSelectOwned() as any)

      // Mock update
      const mockReturning = vi.fn().mockResolvedValue([mockLearner])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })
      vi.mocked(db.update).mockReturnValue(mockUpdate() as any)

      const result = await updateForUser(mockLearnerId, mockUserId, {
        name: 'Updated Name',
        avatar: 'avatar.jpg',
        dateOfBirth: new Date('2020-01-01'),
      })

      expect(result).toEqual(mockLearner)
    })

    it('should return undefined when user is not owner', async () => {
      const mockLimit = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await updateForUser(mockLearnerId, mockUserId, {
        name: 'Updated Name',
        avatar: null,
        dateOfBirth: null,
      })

      expect(result).toBeUndefined()
    })
  })

  describe('deleteForUser', () => {
    it('should delete learner when user is owner', async () => {
      const mockLearner = {
        id: mockLearnerId,
        name: 'Test',
        avatar: null,
        dateOfBirth: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Mock findByIdOwned
      const mockLimitOwned = vi.fn().mockResolvedValue([{ learner: mockLearner }])
      const mockWhereOwned = vi.fn().mockReturnValue({ limit: mockLimitOwned })
      const mockInnerJoinOwned = vi.fn().mockReturnValue({ where: mockWhereOwned })
      const mockFromOwned = vi.fn().mockReturnValue({ innerJoin: mockInnerJoinOwned })
      const mockSelectOwned = vi.fn().mockReturnValue({ from: mockFromOwned })
      vi.mocked(db.select).mockReturnValue(mockSelectOwned() as any)

      // Mock delete
      const mockReturning = vi.fn().mockResolvedValue([{ id: mockLearnerId }])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere })
      vi.mocked(db.delete).mockReturnValue(mockDelete() as any)

      const result = await deleteForUser(mockLearnerId, mockUserId)

      expect(result).toBe(true)
    })

    it('should return false when user is not owner', async () => {
      const mockLimit = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await deleteForUser(mockLearnerId, mockUserId)

      expect(result).toBe(false)
    })
  })
})

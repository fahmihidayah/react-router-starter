import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  create,
  createGroup,
  deleteById,
  deleteGroup,
  deleteProgressEntry,
  findById,
  findByIdForDetail,
  findByLearnerId,
  findEntriesByGoalIds,
  findGroupByName,
  findGroupsByLearnerId,
  moveGoalToGroup,
  renameGroup,
  saveProgressEntry,
} from './index'
import { db } from '~/lib/database'

vi.mock('~/lib/database', () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
    query: {
      goals: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      goalGroups: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
  },
}))

describe('goals queries', () => {
  const mockLearnerId = 'learner-1'
  const mockGoalId = 'goal-1'
  const mockGroupId = 'group-1'
  const mockUserId = 'user-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findByLearnerId', () => {
    it('should return goals for a learner ordered by creation date', async () => {
      const mockGoals = [
        {
          id: 'g1',
          learnerId: mockLearnerId,
          title: 'Goal 1',
          description: null,
          targetValue: 10,
          currentValue: 0,
          unit: 'books',
          groupId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'g2',
          learnerId: mockLearnerId,
          title: 'Goal 2',
          description: null,
          targetValue: 20,
          currentValue: 5,
          unit: 'hours',
          groupId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(db.query.goals.findMany).mockResolvedValue(mockGoals)

      const result = await findByLearnerId(mockLearnerId)

      expect(result).toEqual(mockGoals)
      expect(db.query.goals.findMany).toHaveBeenCalledWith({
        where: { learnerId: mockLearnerId },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should return empty array when no goals found', async () => {
      vi.mocked(db.query.goals.findMany).mockResolvedValue([])

      const result = await findByLearnerId(mockLearnerId)

      expect(result).toEqual([])
    })
  })

  describe('findGroupsByLearnerId', () => {
    it('should return goal groups for a learner', async () => {
      const mockGroups = [
        {
          id: 'gg1',
          learnerId: mockLearnerId,
          name: 'Group 1',
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'gg2',
          learnerId: mockLearnerId,
          name: 'Group 2',
          position: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(db.query.goalGroups.findMany).mockResolvedValue(mockGroups)

      const result = await findGroupsByLearnerId(mockLearnerId)

      expect(result).toEqual(mockGroups)
      expect(db.query.goalGroups.findMany).toHaveBeenCalledWith({
        where: { learnerId: mockLearnerId },
        orderBy: { position: 'asc', createdAt: 'asc' },
      })
    })
  })

  describe('findGroupByName', () => {
    it('should return goal group when found', async () => {
      const mockGroup = {
        id: mockGroupId,
        learnerId: mockLearnerId,
        name: 'Test Group',
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockLimit = vi.fn().mockResolvedValue([mockGroup])
      const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findGroupByName(mockLearnerId, 'Test Group')

      expect(result).toEqual(mockGroup)
    })

    it('should return undefined when group not found', async () => {
      const mockLimit = vi.fn().mockResolvedValue([])
      const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findGroupByName(mockLearnerId, 'Nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('createGroup', () => {
    it('should create and return a goal group', async () => {
      const mockGroup = {
        id: mockGroupId,
        learnerId: mockLearnerId,
        name: 'New Group',
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockReturning = vi.fn().mockResolvedValue([mockGroup])
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues })
      vi.mocked(db.insert).mockReturnValue(mockInsert() as any)

      const result = await createGroup({
        id: mockGroupId,
        learnerId: mockLearnerId,
        name: 'New Group',
        position: 0,
      })

      expect(result).toEqual(mockGroup)
    })
  })

  describe('renameGroup', () => {
    it('should rename group and return updated group', async () => {
      const mockGroup = {
        id: mockGroupId,
        learnerId: mockLearnerId,
        name: 'Renamed Group',
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockReturning = vi.fn().mockResolvedValue([mockGroup])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })
      vi.mocked(db.update).mockReturnValue(mockUpdate() as any)

      const result = await renameGroup(mockGroupId, mockLearnerId, 'Renamed Group')

      expect(result).toEqual(mockGroup)
    })

    it('should return undefined when group not found', async () => {
      const mockReturning = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })
      vi.mocked(db.update).mockReturnValue(mockUpdate() as any)

      const result = await renameGroup(mockGroupId, mockLearnerId, 'Renamed Group')

      expect(result).toBeUndefined()
    })
  })

  describe('deleteGroup', () => {
    it('should delete group and return true', async () => {
      const mockReturning = vi.fn().mockResolvedValue([{ id: mockGroupId }])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere })
      vi.mocked(db.delete).mockReturnValue(mockDelete() as any)

      const result = await deleteGroup(mockGroupId, mockLearnerId)

      expect(result).toBe(true)
    })

    it('should return false when group not found', async () => {
      const mockReturning = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere })
      vi.mocked(db.delete).mockReturnValue(mockDelete() as any)

      const result = await deleteGroup(mockGroupId, mockLearnerId)

      expect(result).toBe(false)
    })
  })

  describe('moveGoalToGroup', () => {
    it('should move goal to valid group', async () => {
      vi.mocked(db.query.goalGroups.findFirst).mockResolvedValue({
        id: mockGroupId,
        learnerId: mockLearnerId,
        name: 'Group',
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const mockReturning = vi.fn().mockResolvedValue([{ id: mockGoalId }])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })
      vi.mocked(db.update).mockReturnValue(mockUpdate() as any)

      const result = await moveGoalToGroup(mockGoalId, mockLearnerId, mockGroupId)

      expect(result).toBe(true)
    })

    it('should return false when group not found', async () => {
      vi.mocked(db.query.goalGroups.findFirst).mockResolvedValue(undefined)

      const result = await moveGoalToGroup(mockGoalId, mockLearnerId, mockGroupId)

      expect(result).toBe(false)
    })

    it('should move goal to ungrouped when groupId is null', async () => {
      const mockReturning = vi.fn().mockResolvedValue([{ id: mockGoalId }])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })
      vi.mocked(db.update).mockReturnValue(mockUpdate() as any)

      const result = await moveGoalToGroup(mockGoalId, mockLearnerId, null)

      expect(result).toBe(true)
    })
  })

  describe('findById', () => {
    it('should return goal when found', async () => {
      const mockGoal = {
        id: mockGoalId,
        learnerId: mockLearnerId,
        title: 'Test Goal',
        description: 'Description',
        targetValue: 10,
        currentValue: 0,
        unit: 'books',
        groupId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(db.query.goals.findFirst).mockResolvedValue(mockGoal)

      const result = await findById(mockGoalId, mockLearnerId)

      expect(result).toEqual(mockGoal)
      expect(db.query.goals.findFirst).toHaveBeenCalledWith({
        where: { id: mockGoalId, learnerId: mockLearnerId },
      })
    })

    it('should return undefined when goal not found', async () => {
      vi.mocked(db.query.goals.findFirst).mockResolvedValue(undefined)

      const result = await findById(mockGoalId, mockLearnerId)

      expect(result).toBeUndefined()
    })
  })

  describe('findByIdForDetail', () => {
    it('should return goal when found', async () => {
      const mockGoal = {
        id: mockGoalId,
        learnerId: mockLearnerId,
        title: 'Test Goal',
        description: 'Description',
        targetValue: 10,
        currentValue: 0,
        unit: 'books',
        groupId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(db.query.goals.findFirst).mockResolvedValue(mockGoal)

      const result = await findByIdForDetail(mockGoalId)

      expect(result).toEqual(mockGoal)
      expect(db.query.goals.findFirst).toHaveBeenCalledWith({
        where: { id: mockGoalId },
      })
    })
  })

  describe('findEntriesByGoalIds', () => {
    it('should return progress entries for goal IDs', async () => {
      const mockEntries = [
        {
          entry: {
            id: 'e1',
            goalId: 'g1',
            value: 5,
            activityDate: new Date('2024-01-15'),
            recordedByUserId: mockUserId,
            note: 'Progress note',
            createdAt: new Date(),
            updatedAt: new Date(),
            activityId: null,
            learnerId: mockLearnerId,
          },
          recordedByName: 'Test User',
        },
      ]

      const mockOrderBy = vi.fn().mockResolvedValue(mockEntries)
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findEntriesByGoalIds(['g1', 'g2'])

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('goalId', 'g1')
      expect(result[0]).toHaveProperty('recordedByName', 'Test User')
    })

    it('should return empty array when no goal IDs provided', async () => {
      const result = await findEntriesByGoalIds([])

      expect(result).toEqual([])
    })

    it('should filter out entries without goalId or value', async () => {
      const mockEntries = [
        {
          entry: {
            id: 'e1',
            goalId: null,
            value: 5,
            activityDate: new Date(),
            recordedByUserId: mockUserId,
            note: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            activityId: null,
            learnerId: mockLearnerId,
          },
          recordedByName: 'Test User',
        },
        {
          entry: {
            id: 'e2',
            goalId: 'g1',
            value: null,
            activityDate: new Date(),
            recordedByUserId: mockUserId,
            note: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            activityId: null,
            learnerId: mockLearnerId,
          },
          recordedByName: 'Test User',
        },
      ]

      const mockOrderBy = vi.fn().mockResolvedValue(mockEntries)
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findEntriesByGoalIds(['g1'])

      expect(result).toHaveLength(0)
    })
  })

  describe('create', () => {
    it('should create and return a goal', async () => {
      const mockGoal = {
        id: mockGoalId,
        learnerId: mockLearnerId,
        title: 'New Goal',
        description: 'Description',
        targetValue: 10,
        currentValue: 0,
        unit: 'books',
        groupId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockReturning = vi.fn().mockResolvedValue([mockGoal])
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues })
      vi.mocked(db.insert).mockReturnValue(mockInsert() as any)

      const result = await create({
        id: mockGoalId,
        learnerId: mockLearnerId,
        title: 'New Goal',
        description: 'Description',
        targetValue: 10,
        currentValue: 0,
        unit: 'books',
        groupId: null,
      })

      expect(result).toEqual(mockGoal)
    })
  })

  describe('saveProgressEntry', () => {
    it('should save and return a progress entry', async () => {
      const mockEntry = {
        id: 'e1',
        goalId: mockGoalId,
        value: 5,
        activityDate: new Date('2024-01-15'),
        recordedByUserId: mockUserId,
        note: 'Progress note',
        createdAt: new Date(),
        updatedAt: new Date(),
        activityId: null,
        learnerId: mockLearnerId,
      }

      const mockReturning = vi.fn().mockResolvedValue([mockEntry])
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues })
      vi.mocked(db.insert).mockReturnValue(mockInsert() as any)

      const result = await saveProgressEntry({
        id: 'e1',
        goalId: mockGoalId,
        value: 5,
        activityDate: new Date('2024-01-15'),
        recordedByUserId: mockUserId,
        note: 'Progress note',
        activityId: null,
        learnerId: mockLearnerId,
      })

      expect(result).toEqual(mockEntry)
    })
  })

  describe('deleteProgressEntry', () => {
    it('should delete progress entry and return true', async () => {
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'e1' }])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere })
      vi.mocked(db.delete).mockReturnValue(mockDelete() as any)

      const result = await deleteProgressEntry('e1', mockGoalId)

      expect(result).toBe(true)
    })

    it('should return false when entry not found', async () => {
      const mockReturning = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere })
      vi.mocked(db.delete).mockReturnValue(mockDelete() as any)

      const result = await deleteProgressEntry('e1', mockGoalId)

      expect(result).toBe(false)
    })
  })

  describe('deleteById', () => {
    it('should delete goal and return true', async () => {
      const mockReturning = vi.fn().mockResolvedValue([{ id: mockGoalId }])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere })
      vi.mocked(db.delete).mockReturnValue(mockDelete() as any)

      const result = await deleteById(mockGoalId, mockLearnerId)

      expect(result).toBe(true)
    })

    it('should return false when goal not found', async () => {
      const mockReturning = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere })
      vi.mocked(db.delete).mockReturnValue(mockDelete() as any)

      const result = await deleteById(mockGoalId, mockLearnerId)

      expect(result).toBe(false)
    })
  })
})

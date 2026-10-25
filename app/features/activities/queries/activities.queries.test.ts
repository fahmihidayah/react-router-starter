import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  archiveTrack,
  createRecord,
  createTrack,
  deleteRecord,
  findActivitiesByLearnerId,
  findActivitiesByTrackId,
  findActiveTrackByName,
  findAllTracksByLearnerId,
  findRecordContextsByLearnerIdsOnDate,
  findRecordsByLearnerIds,
  findRecordsByLearnerIdsFromDate,
  findRecentRecordsByLearnerIds,
  findTrackById,
  findTrackByIdForDetail,
  findTracksByLearnerId,
  renameTrack,
} from './index'
import { db } from '~/lib/database'

vi.mock('~/lib/database', () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
    query: {
      activityTracks: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
  },
}))

describe('activities queries', () => {
  const mockLearnerId = 'learner-1'
  const mockTrackId = 'track-1'
  const mockUserId = 'user-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findTracksByLearnerId', () => {
    it('should return active tracks for a learner', async () => {
      const mockTracks = [
        {
          id: 't1',
          learnerId: mockLearnerId,
          name: 'Reading',
          icon: '📚',
          color: '#FF0000',
          unit: 'books',
          archivedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 't2',
          learnerId: mockLearnerId,
          name: 'Math',
          icon: '🔢',
          color: '#00FF00',
          unit: 'exercises',
          archivedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(db.query.activityTracks.findMany).mockResolvedValue(mockTracks)

      const result = await findTracksByLearnerId(mockLearnerId)

      expect(result).toEqual(mockTracks)
      expect(db.query.activityTracks.findMany).toHaveBeenCalledWith({
        where: { learnerId: mockLearnerId, archivedAt: { isNull: true } },
        orderBy: { name: 'asc' },
      })
    })

    it('should return empty array when no tracks found', async () => {
      vi.mocked(db.query.activityTracks.findMany).mockResolvedValue([])

      const result = await findTracksByLearnerId(mockLearnerId)

      expect(result).toEqual([])
    })
  })

  describe('findAllTracksByLearnerId', () => {
    it('should return all tracks including archived', async () => {
      const mockTracks = [
        {
          id: 't1',
          learnerId: mockLearnerId,
          name: 'Reading',
          icon: '📚',
          color: '#FF0000',
          unit: 'books',
          archivedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 't2',
          learnerId: mockLearnerId,
          name: 'Old Track',
          icon: '📝',
          color: '#0000FF',
          unit: 'pages',
          archivedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(db.query.activityTracks.findMany).mockResolvedValue(mockTracks)

      const result = await findAllTracksByLearnerId(mockLearnerId)

      expect(result).toEqual(mockTracks)
      expect(db.query.activityTracks.findMany).toHaveBeenCalledWith({
        where: { learnerId: mockLearnerId },
        orderBy: { name: 'asc' },
      })
    })
  })

  describe('findTrackById', () => {
    it('should return track when found', async () => {
      const mockTrack = {
        id: mockTrackId,
        learnerId: mockLearnerId,
        name: 'Reading',
        icon: '📚',
        color: '#FF0000',
        unit: 'books',
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(db.query.activityTracks.findFirst).mockResolvedValue(mockTrack)

      const result = await findTrackById(mockTrackId, mockLearnerId)

      expect(result).toEqual(mockTrack)
      expect(db.query.activityTracks.findFirst).toHaveBeenCalledWith({
        where: { id: mockTrackId, learnerId: mockLearnerId },
      })
    })

    it('should return undefined when track not found', async () => {
      vi.mocked(db.query.activityTracks.findFirst).mockResolvedValue(undefined)

      const result = await findTrackById(mockTrackId, mockLearnerId)

      expect(result).toBeUndefined()
    })
  })

  describe('findTrackByIdForDetail', () => {
    it('should return track by ID without learner filter', async () => {
      const mockTrack = {
        id: mockTrackId,
        learnerId: mockLearnerId,
        name: 'Reading',
        icon: '📚',
        color: '#FF0000',
        unit: 'books',
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(db.query.activityTracks.findFirst).mockResolvedValue(mockTrack)

      const result = await findTrackByIdForDetail(mockTrackId)

      expect(result).toEqual(mockTrack)
      expect(db.query.activityTracks.findFirst).toHaveBeenCalledWith({
        where: { id: mockTrackId },
      })
    })
  })

  describe('findActiveTrackByName', () => {
    it('should return active track by name', async () => {
      const mockTrack = {
        id: mockTrackId,
        learnerId: mockLearnerId,
        name: 'Reading',
        icon: '📚',
        color: '#FF0000',
        unit: 'books',
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockLimit = vi.fn().mockResolvedValue([mockTrack])
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findActiveTrackByName(mockLearnerId, 'Reading')

      expect(result).toEqual(mockTrack)
    })

    it('should return undefined when no active track with name found', async () => {
      const mockLimit = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findActiveTrackByName(mockLearnerId, 'Nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('findRecordsByLearnerIds', () => {
    it('should return records with user and track details', async () => {
      const mockRows = [
        {
          record: {
            id: 'r1',
            learnerId: mockLearnerId,
            trackId: mockTrackId,
            goalId: null,
            activityDate: new Date('2024-01-15'),
            value: 5,
            note: 'Read 5 books',
            recordedByUserId: mockUserId,
            activityId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          recordedByName: 'Test User',
          trackName: 'Reading',
        },
      ]

      const mockOrderBy = vi.fn().mockResolvedValue(mockRows)
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockLeftJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockInnerJoin = vi.fn().mockReturnValue({ leftJoin: mockLeftJoin })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findRecordsByLearnerIds([mockLearnerId])

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('recordedByName', 'Test User')
      expect(result[0]).toHaveProperty('trackName', 'Reading')
    })

    it('should return empty array when no learner IDs provided', async () => {
      const result = await findRecordsByLearnerIds([])

      expect(result).toEqual([])
    })
  })

  describe('findRecentRecordsByLearnerIds', () => {
    it('should return limited recent records', async () => {
      const mockRows = [
        {
          record: {
            id: 'r1',
            learnerId: mockLearnerId,
            trackId: mockTrackId,
            goalId: null,
            activityDate: new Date('2024-01-15'),
            value: 5,
            note: null,
            recordedByUserId: mockUserId,
            activityId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          recordedByName: 'Test User',
          trackName: 'Reading',
        },
      ]

      const mockLimit = vi.fn().mockResolvedValue(mockRows)
      const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockLeftJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockInnerJoin = vi.fn().mockReturnValue({ leftJoin: mockLeftJoin })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findRecentRecordsByLearnerIds([mockLearnerId], 10)

      expect(result).toHaveLength(1)
    })

    it('should return empty array when no learner IDs provided', async () => {
      const result = await findRecentRecordsByLearnerIds([], 10)

      expect(result).toEqual([])
    })
  })

  describe('findRecordsByLearnerIdsFromDate', () => {
    it('should return records from a specific date', async () => {
      const fromDate = new Date('2024-01-01')
      const mockRows = [
        {
          record: {
            id: 'r1',
            learnerId: mockLearnerId,
            trackId: mockTrackId,
            goalId: null,
            activityDate: new Date('2024-01-15'),
            value: 5,
            note: null,
            recordedByUserId: mockUserId,
            activityId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          recordedByName: 'Test User',
          trackName: 'Reading',
        },
      ]

      const mockOrderBy = vi.fn().mockResolvedValue(mockRows)
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockLeftJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockInnerJoin = vi.fn().mockReturnValue({ leftJoin: mockLeftJoin })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findRecordsByLearnerIdsFromDate([mockLearnerId], fromDate)

      expect(result).toHaveLength(1)
    })

    it('should return empty array when no learner IDs provided', async () => {
      const result = await findRecordsByLearnerIdsFromDate([], new Date())

      expect(result).toEqual([])
    })
  })

  describe('findRecordContextsByLearnerIdsOnDate', () => {
    it('should return record contexts for specific date', async () => {
      const activityDate = new Date('2024-01-15')
      const mockContexts = [
        { learnerId: mockLearnerId, goalId: 'goal-1' },
        { learnerId: mockLearnerId, goalId: null },
      ]

      const mockWhere = vi.fn().mockResolvedValue(mockContexts)
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findRecordContextsByLearnerIdsOnDate([mockLearnerId], activityDate)

      expect(result).toEqual(mockContexts)
    })

    it('should return empty array when no learner IDs provided', async () => {
      const result = await findRecordContextsByLearnerIdsOnDate([], new Date())

      expect(result).toEqual([])
    })
  })

  describe('findActivitiesByLearnerId', () => {
    it('should return only activities without goals', async () => {
      const mockRows = [
        {
          record: {
            id: 'r1',
            learnerId: mockLearnerId,
            trackId: mockTrackId,
            goalId: null,
            activityDate: new Date(),
            value: 5,
            note: null,
            recordedByUserId: mockUserId,
            activityId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          recordedByName: 'Test User',
          trackName: 'Reading',
        },
        {
          record: {
            id: 'r2',
            learnerId: mockLearnerId,
            trackId: mockTrackId,
            goalId: 'goal-1',
            activityDate: new Date(),
            value: 3,
            note: null,
            recordedByUserId: mockUserId,
            activityId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          recordedByName: 'Test User',
          trackName: 'Reading',
        },
      ]

      const mockOrderBy = vi.fn().mockResolvedValue(mockRows)
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockLeftJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockInnerJoin = vi.fn().mockReturnValue({ leftJoin: mockLeftJoin })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findActivitiesByLearnerId(mockLearnerId)

      expect(result).toHaveLength(1)
      expect(result[0].goalId).toBeNull()
    })
  })

  describe('findActivitiesByTrackId', () => {
    it('should return activities for a specific track', async () => {
      const mockRows = [
        {
          record: {
            id: 'r1',
            learnerId: mockLearnerId,
            trackId: mockTrackId,
            goalId: null,
            activityDate: new Date(),
            value: 5,
            note: null,
            recordedByUserId: mockUserId,
            activityId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          recordedByName: 'Test User',
          trackName: 'Reading',
        },
      ]

      const mockOrderBy = vi.fn().mockResolvedValue(mockRows)
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockLeftJoin = vi.fn().mockReturnValue({ where: mockWhere })
      const mockInnerJoin = vi.fn().mockReturnValue({ leftJoin: mockLeftJoin })
      const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin })
      const mockSelect = vi.fn().mockReturnValue({ from: mockFrom })
      vi.mocked(db.select).mockReturnValue(mockSelect() as any)

      const result = await findActivitiesByTrackId(mockTrackId)

      expect(result).toHaveLength(1)
    })
  })

  describe('createRecord', () => {
    it('should create and return a learning record', async () => {
      const mockRecord = {
        id: 'r1',
        learnerId: mockLearnerId,
        trackId: mockTrackId,
        goalId: null,
        activityDate: new Date('2024-01-15'),
        value: 5,
        note: 'Test note',
        recordedByUserId: mockUserId,
        activityId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockReturning = vi.fn().mockResolvedValue([mockRecord])
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues })
      vi.mocked(db.insert).mockReturnValue(mockInsert() as any)

      const result = await createRecord({
        id: 'r1',
        learnerId: mockLearnerId,
        trackId: mockTrackId,
        goalId: null,
        activityDate: new Date('2024-01-15'),
        value: 5,
        note: 'Test note',
        recordedByUserId: mockUserId,
        activityId: null,
      })

      expect(result).toEqual(mockRecord)
    })
  })

  describe('deleteRecord', () => {
    it('should delete activity record and return true', async () => {
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'r1' }])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere })
      vi.mocked(db.delete).mockReturnValue(mockDelete() as any)

      const result = await deleteRecord('r1', mockLearnerId)

      expect(result).toBe(true)
    })

    it('should return false when record not found or has goal', async () => {
      const mockReturning = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockDelete = vi.fn().mockReturnValue({ where: mockWhere })
      vi.mocked(db.delete).mockReturnValue(mockDelete() as any)

      const result = await deleteRecord('r1', mockLearnerId)

      expect(result).toBe(false)
    })
  })

  describe('createTrack', () => {
    it('should create and return an activity track', async () => {
      const mockTrack = {
        id: mockTrackId,
        learnerId: mockLearnerId,
        name: 'Reading',
        icon: '📚',
        color: '#FF0000',
        unit: 'books',
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockReturning = vi.fn().mockResolvedValue([mockTrack])
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockInsert = vi.fn().mockReturnValue({ values: mockValues })
      vi.mocked(db.insert).mockReturnValue(mockInsert() as any)

      const result = await createTrack({
        id: mockTrackId,
        learnerId: mockLearnerId,
        name: 'Reading',
        icon: '📚',
        color: '#FF0000',
        unit: 'books',
      })

      expect(result).toEqual(mockTrack)
    })
  })

  describe('renameTrack', () => {
    it('should rename track and return updated track', async () => {
      const mockTrack = {
        id: mockTrackId,
        learnerId: mockLearnerId,
        name: 'Renamed Track',
        icon: '📚',
        color: '#FF0000',
        unit: 'books',
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockReturning = vi.fn().mockResolvedValue([mockTrack])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })
      vi.mocked(db.update).mockReturnValue(mockUpdate() as any)

      const result = await renameTrack(mockTrackId, mockLearnerId, 'Renamed Track')

      expect(result).toEqual(mockTrack)
    })

    it('should return undefined when track not found', async () => {
      const mockReturning = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })
      vi.mocked(db.update).mockReturnValue(mockUpdate() as any)

      const result = await renameTrack(mockTrackId, mockLearnerId, 'Renamed Track')

      expect(result).toBeUndefined()
    })
  })

  describe('archiveTrack', () => {
    it('should archive track and return true', async () => {
      const mockReturning = vi.fn().mockResolvedValue([{ id: mockTrackId }])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })
      vi.mocked(db.update).mockReturnValue(mockUpdate() as any)

      const result = await archiveTrack(mockTrackId, mockLearnerId)

      expect(result).toBe(true)
    })

    it('should return false when track not found', async () => {
      const mockReturning = vi.fn().mockResolvedValue([])
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
      const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })
      vi.mocked(db.update).mockReturnValue(mockUpdate() as any)

      const result = await archiveTrack(mockTrackId, mockLearnerId)

      expect(result).toBe(false)
    })
  })
})

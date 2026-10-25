import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '~/lib/database'
import {
  getAllTermsAcceptances,
  getLatestTermsAcceptance,
  recordTermsAcceptance,
} from './terms.queries'

vi.mock('~/lib/database', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
  },
}))

describe('terms.queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-acceptance-id')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getLatestTermsAcceptance', () => {
    it('should return latest terms acceptance', async () => {
      const mockAcceptance = {
        id: 'acceptance-1',
        userId: 'user-1',
        termsVersion: '1.0.0',
        privacyVersion: '1.0.0',
        acceptanceType: 'registration',
        acceptedAt: new Date(),
      }

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockAcceptance]),
            }),
          }),
        }),
      } as never)

      const result = await getLatestTermsAcceptance('user-1')

      expect(result).toEqual(mockAcceptance)
      expect(db.select).toHaveBeenCalled()
    })

    it('should return null if no acceptance exists', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as never)

      const result = await getLatestTermsAcceptance('user-1')

      expect(result).toBeNull()
    })
  })

  describe('recordTermsAcceptance', () => {
    it('should record terms acceptance', async () => {
      const acceptanceData = {
        userId: 'user-1',
        termsVersion: '1.0.0',
        privacyVersion: '1.0.0',
        acceptanceType: 'registration' as const,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser',
      }

      const mockAcceptance = {
        id: 'test-acceptance-id',
        ...acceptanceData,
        createdAt: new Date(),
        acceptedAt: new Date(),
      }

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockAcceptance]),
        }),
      } as never)

      const result = await recordTermsAcceptance(acceptanceData)

      expect(result).toEqual(mockAcceptance)
      expect(db.insert).toHaveBeenCalled()
    })

    it('should handle different acceptance types', async () => {
      const acceptanceTypes = ['registration', 'update', 'forced'] as const

      for (const type of acceptanceTypes) {
        const data = {
          userId: 'user-1',
          termsVersion: '1.0.0',
          privacyVersion: '1.0.0',
          acceptanceType: type,
        }

        const mockAcceptance = { id: 'test-id', ...data }

        vi.mocked(db.insert).mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockAcceptance]),
          }),
        } as never)

        const result = await recordTermsAcceptance(data)

        expect(result.acceptanceType).toBe(type)
      }
    })
  })

  describe('getAllTermsAcceptances', () => {
    it('should return all terms acceptances for user', async () => {
      const mockAcceptances = [
        {
          id: 'acceptance-1',
          userId: 'user-1',
          termsVersion: '2.0.0',
          privacyVersion: '2.0.0',
          acceptanceType: 'update',
          acceptedAt: new Date('2024-10-15'),
        },
        {
          id: 'acceptance-2',
          userId: 'user-1',
          termsVersion: '1.0.0',
          privacyVersion: '1.0.0',
          acceptanceType: 'registration',
          acceptedAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockAcceptances),
          }),
        }),
      } as never)

      const result = await getAllTermsAcceptances('user-1')

      expect(result).toEqual(mockAcceptances)
      expect(result.length).toBe(2)
    })

    it('should return empty array if no acceptances', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never)

      const result = await getAllTermsAcceptances('user-1')

      expect(result).toEqual([])
    })
  })
})

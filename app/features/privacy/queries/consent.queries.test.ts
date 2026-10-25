import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '~/lib/database'
import {
  getConsentHistory,
  getUserConsent,
  recordConsentChange,
  upsertUserConsent,
} from './consent.queries'

vi.mock('~/lib/database', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
  },
}))

describe('consent.queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-id-123')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getUserConsent', () => {
    it('should return user consent if exists', async () => {
      const mockConsent = {
        id: 'consent-1',
        userId: 'user-1',
        analyticsConsent: true,
        marketingConsent: false,
        functionalConsent: true,
        consentVersion: '1.0.0',
      }

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockConsent]),
        }),
      } as never)

      const result = await getUserConsent('user-1')

      expect(result).toEqual(mockConsent)
      expect(db.select).toHaveBeenCalled()
    })

    it('should return null if no consent exists', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as never)

      const result = await getUserConsent('user-1')

      expect(result).toBeNull()
    })
  })

  describe('upsertUserConsent', () => {
    it('should create new consent if none exists', async () => {
      const consentData = {
        userId: 'user-1',
        analyticsConsent: true,
        marketingConsent: false,
        functionalConsent: true,
        consentVersion: '1.0.0',
      }

      const mockCreated = { id: 'test-id-123', ...consentData }

      // Mock getUserConsent to return null
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as never)

      // Mock insert
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCreated]),
        }),
      } as never)

      const result = await upsertUserConsent(consentData)

      expect(result).toEqual(mockCreated)
      expect(db.insert).toHaveBeenCalled()
    })

    it('should update existing consent', async () => {
      const existingConsent = {
        id: 'consent-1',
        userId: 'user-1',
        analyticsConsent: false,
        marketingConsent: false,
        functionalConsent: true,
        consentVersion: '1.0.0',
      }

      const updateData = {
        userId: 'user-1',
        analyticsConsent: true,
        marketingConsent: true,
        functionalConsent: true,
        consentVersion: '1.0.0',
      }

      // Mock getUserConsent to return existing
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([existingConsent]),
        }),
      } as never)

      const mockUpdated = { ...existingConsent, ...updateData }

      // Mock update
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdated]),
          }),
        }),
      } as never)

      const result = await upsertUserConsent(updateData)

      expect(result).toEqual(mockUpdated)
      expect(db.update).toHaveBeenCalled()
    })
  })

  describe('recordConsentChange', () => {
    it('should record consent change in history', async () => {
      const changeData = {
        userId: 'user-1',
        consentType: 'analytics' as const,
        consentValue: true,
        consentVersion: '1.0.0',
        ipAddress: '127.0.0.1',
      }

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as never)

      await recordConsentChange(changeData)

      expect(db.insert).toHaveBeenCalled()
    })
  })

  describe('getConsentHistory', () => {
    it('should return consent history for user', async () => {
      const mockHistory = [
        {
          id: 'hist-1',
          userId: 'user-1',
          consentType: 'analytics',
          consentValue: true,
          consentVersion: '1.0.0',
          createdAt: new Date(),
        },
        {
          id: 'hist-2',
          userId: 'user-1',
          consentType: 'marketing',
          consentValue: false,
          consentVersion: '1.0.0',
          createdAt: new Date(),
        },
      ]

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockHistory),
            }),
          }),
        }),
      } as never)

      const result = await getConsentHistory('user-1')

      expect(result).toEqual(mockHistory)
      expect(db.select).toHaveBeenCalled()
    })

    it('should respect limit parameter', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as never)

      await getConsentHistory('user-1', 10)

      const limitMock = vi.mocked(db.select().from().where().orderBy().limit)
      expect(limitMock).toHaveBeenCalledWith(10)
    })
  })
})

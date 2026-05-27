import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { accountRepository } from './account-repository'
import { userRepository } from './user-repository'
import { db } from '~/lib/database'
import { accounts, users } from '~/db/schema'
import { eq } from 'drizzle-orm'

describe('AccountRepository', () => {
  // Create a test user before each test
  beforeEach(async () => {
    await userRepository.create({
      id: 'u1',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      image: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    })
  })

  // Clean up after each test
  afterEach(async () => {
    await db.delete(account)
    await db.delete(user)
  })

  describe('create', () => {
    it('creates and returns a new account', async () => {
      const now = new Date()
      const newAccount = {
        id: 'acc1',
        accountId: 'test@example.com',
        providerId: 'credential',
        userId: 'u1',
        password: 'hashed_password',
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      }

      const result = await accountRepository.create(newAccount)

      expect(result).toMatchObject({
        id: 'acc1',
        accountId: 'test@example.com',
        providerId: 'credential',
        userId: 'u1',
        password: 'hashed_password',
      })
    })

    it('persists the created account in database', async () => {
      const now = new Date()
      const newAccount = {
        id: 'acc2',
        accountId: 'test@example.com',
        providerId: 'credential',
        userId: 'u1',
        password: 'hashed_password',
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      }

      await accountRepository.create(newAccount)
      const found = await accountRepository.findById('acc2')

      expect(found).toMatchObject(newAccount)
    })

    it('creates account with OAuth tokens', async () => {
      const now = new Date()
      const expiry = new Date(now.getTime() + 3600000)
      const oauthAccount = {
        id: 'acc3',
        accountId: 'github_user_123',
        providerId: 'github',
        userId: 'u1',
        password: null,
        accessToken: 'github_access_token',
        refreshToken: 'github_refresh_token',
        idToken: 'github_id_token',
        accessTokenExpiresAt: expiry,
        refreshTokenExpiresAt: expiry,
        scope: 'user:email',
        createdAt: now,
        updatedAt: now,
      }

      const result = await accountRepository.create(oauthAccount)

      expect(result.accessToken).toBe('github_access_token')
      expect(result.providerId).toBe('github')
      expect(result.scope).toBe('user:email')
    })
  })

  describe('createMany', () => {
    it('creates multiple accounts', async () => {
      const now = new Date()
      const accounts = [
        {
          id: 'acc1',
          accountId: 'test@example.com',
          providerId: 'credential',
          userId: 'u1',
          password: 'hash1',
          accessToken: null,
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'acc2',
          accountId: 'github_user',
          providerId: 'github',
          userId: 'u1',
          password: null,
          accessToken: 'token',
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
      ]

      const results = await accountRepository.createMany(accounts)

      expect(results).toHaveLength(2)
      expect(results[0].id).toBe('acc1')
      expect(results[1].id).toBe('acc2')
    })

    it('persists all created accounts', async () => {
      const now = new Date()
      const accounts = [
        {
          id: 'acc1',
          accountId: 'test@example.com',
          providerId: 'credential',
          userId: 'u1',
          password: 'hash',
          accessToken: null,
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'acc2',
          accountId: 'google_user',
          providerId: 'google',
          userId: 'u1',
          password: null,
          accessToken: 'google_token',
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
      ]

      await accountRepository.createMany(accounts)
      const all = await accountRepository.findAll()

      expect(all).toHaveLength(2)
    })
  })

  describe('findById', () => {
    it('returns the account when it exists', async () => {
      const now = new Date()
      await accountRepository.create({
        id: 'acc1',
        accountId: 'test@example.com',
        providerId: 'credential',
        userId: 'u1',
        password: 'hash',
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      })

      const result = await accountRepository.findById('acc1')

      expect(result).toMatchObject({
        id: 'acc1',
        accountId: 'test@example.com',
        providerId: 'credential',
      })
    })

    it('returns undefined when account does not exist', async () => {
      const result = await accountRepository.findById('nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('findOne', () => {
    it('finds account by userId', async () => {
      const now = new Date()
      await accountRepository.create({
        id: 'acc1',
        accountId: 'test@example.com',
        providerId: 'credential',
        userId: 'u1',
        password: 'hash',
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      })

      const result = await accountRepository.findOne(eq(account.userId, 'u1'))

      expect(result?.userId).toBe('u1')
    })

    it('finds account by providerId', async () => {
      const now = new Date()
      await accountRepository.create({
        id: 'acc1',
        accountId: 'github123',
        providerId: 'github',
        userId: 'u1',
        password: null,
        accessToken: 'token',
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      })

      const result = await accountRepository.findOne(eq(account.providerId, 'github'))

      expect(result?.providerId).toBe('github')
    })

    it('returns undefined when no match found', async () => {
      const result = await accountRepository.findOne(eq(account.providerId, 'nonexistent'))

      expect(result).toBeUndefined()
    })
  })

  describe('findMany', () => {
    it('returns all accounts for a user', async () => {
      const now = new Date()
      await accountRepository.createMany([
        {
          id: 'acc1',
          accountId: 'test@example.com',
          providerId: 'credential',
          userId: 'u1',
          password: 'hash',
          accessToken: null,
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'acc2',
          accountId: 'github123',
          providerId: 'github',
          userId: 'u1',
          password: null,
          accessToken: 'token',
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
      ])

      const results = await accountRepository.findMany(eq(account.userId, 'u1'))

      expect(results).toHaveLength(2)
      expect(results.map((a) => a.providerId)).toEqual(
        expect.arrayContaining(['credential', 'github'])
      )
    })

    it('returns empty array when no accounts match', async () => {
      const results = await accountRepository.findMany(eq(account.userId, 'nonexistent'))

      expect(results).toEqual([])
    })
  })

  describe('findAll', () => {
    it('returns all accounts', async () => {
      const now = new Date()
      await accountRepository.createMany([
        {
          id: 'acc1',
          accountId: 'test@example.com',
          providerId: 'credential',
          userId: 'u1',
          password: 'hash',
          accessToken: null,
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'acc2',
          accountId: 'google123',
          providerId: 'google',
          userId: 'u1',
          password: null,
          accessToken: 'token',
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
      ])

      const results = await accountRepository.findAll()

      expect(results).toHaveLength(2)
    })

    it('returns empty array when no accounts exist', async () => {
      const results = await accountRepository.findAll()

      expect(results).toEqual([])
    })
  })

  describe('findManyPaginated', () => {
    beforeEach(async () => {
      const now = new Date()
      // Create additional user for testing
      await userRepository.create({
        id: 'u2',
        name: 'User 2',
        email: 'user2@example.com',
        emailVerified: false,
        image: null,
        createdAt: now,
        updatedAt: now,
      })

      // Create multiple accounts
      await accountRepository.createMany([
        {
          id: 'acc1',
          accountId: 'acc1',
          providerId: 'credential',
          userId: 'u1',
          password: 'hash1',
          accessToken: null,
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'acc2',
          accountId: 'acc2',
          providerId: 'github',
          userId: 'u1',
          password: null,
          accessToken: 'token',
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'acc3',
          accountId: 'acc3',
          providerId: 'google',
          userId: 'u2',
          password: null,
          accessToken: 'token',
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
      ])
    })

    it('returns paginated results with correct metadata', async () => {
      const result = await accountRepository.findManyPaginated({
        page: 1,
        pageSize: 2,
      })

      expect(result.data).toHaveLength(2)
      expect(result.pagination.totalItems).toBe(3)
      expect(result.pagination.totalPages).toBe(2)
      expect(result.pagination.currentPage).toBe(1)
    })

    it('returns correct page 2 results', async () => {
      const result = await accountRepository.findManyPaginated({
        page: 2,
        pageSize: 2,
      })

      expect(result.data).toHaveLength(1)
      expect(result.pagination.currentPage).toBe(2)
      expect(result.pagination.totalPages).toBe(2)
    })

    it('filters results with where clause', async () => {
      const result = await accountRepository.findManyPaginated({
        where: eq(account.userId, 'u1'),
        page: 1,
        pageSize: 10,
      })

      expect(result.data).toHaveLength(2)
      expect(result.data.every((a) => a.userId === 'u1')).toBe(true)
    })

    it('returns empty results when filter matches nothing', async () => {
      const result = await accountRepository.findManyPaginated({
        where: eq(account.userId, 'nonexistent'),
        page: 1,
        pageSize: 10,
      })

      expect(result.data).toHaveLength(0)
      expect(result.pagination.totalItems).toBe(0)
      expect(result.pagination.totalPages).toBe(0)
    })
  })

  describe('update', () => {
    it('updates account fields and returns the updated account', async () => {
      const now = new Date()
      await accountRepository.create({
        id: 'acc1',
        accountId: 'test@example.com',
        providerId: 'credential',
        userId: 'u1',
        password: 'old_hash',
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      })

      const result = await accountRepository.update('acc1', {
        password: 'new_hash',
        updatedAt: new Date(),
      })

      expect(result?.password).toBe('new_hash')
    })

    it('persists updates to database', async () => {
      const now = new Date()
      await accountRepository.create({
        id: 'acc1',
        accountId: 'test@example.com',
        providerId: 'credential',
        userId: 'u1',
        password: 'hash',
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      })

      await accountRepository.update('acc1', {
        accessToken: 'new_token',
        updatedAt: new Date(),
      })

      const updated = await accountRepository.findById('acc1')
      expect(updated?.accessToken).toBe('new_token')
    })

    it('updates only specified fields', async () => {
      const now = new Date()
      const originalPassword = 'original_hash'
      await accountRepository.create({
        id: 'acc1',
        accountId: 'test@example.com',
        providerId: 'credential',
        userId: 'u1',
        password: originalPassword,
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      })

      await accountRepository.update('acc1', {
        accessToken: 'new_token',
        updatedAt: new Date(),
      })

      const updated = await accountRepository.findById('acc1')
      expect(updated?.password).toBe(originalPassword)
      expect(updated?.accessToken).toBe('new_token')
    })
  })

  describe('updateMany', () => {
    it('updates multiple accounts matching condition', async () => {
      const now = new Date()
      await accountRepository.createMany([
        {
          id: 'acc1',
          accountId: 'acc1',
          providerId: 'credential',
          userId: 'u1',
          password: 'hash',
          accessToken: null,
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'acc2',
          accountId: 'acc2',
          providerId: 'github',
          userId: 'u1',
          password: null,
          accessToken: 'old_token',
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
      ])

      const results = await accountRepository.updateMany(eq(account.userId, 'u1'), {
        scope: 'updated_scope',
        updatedAt: new Date(),
      })

      expect(results).toHaveLength(2)
      expect(results.every((a) => a.scope === 'updated_scope')).toBe(true)
    })
  })

  describe('delete', () => {
    it('removes the account', async () => {
      const now = new Date()
      await accountRepository.create({
        id: 'acc1',
        accountId: 'test@example.com',
        providerId: 'credential',
        userId: 'u1',
        password: 'hash',
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      })

      await accountRepository.delete('acc1')

      const result = await accountRepository.findById('acc1')
      expect(result).toBeUndefined()
    })

    it('reduces total account count', async () => {
      const now = new Date()
      await accountRepository.create({
        id: 'acc1',
        accountId: 'test@example.com',
        providerId: 'credential',
        userId: 'u1',
        password: 'hash',
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      })

      const beforeCount = (await accountRepository.findAll()).length
      await accountRepository.delete('acc1')
      const afterCount = (await accountRepository.findAll()).length

      expect(afterCount).toBe(beforeCount - 1)
    })
  })

  describe('deleteMany', () => {
    it('removes multiple accounts by condition', async () => {
      const now = new Date()
      await accountRepository.createMany([
        {
          id: 'acc1',
          accountId: 'acc1',
          providerId: 'credential',
          userId: 'u1',
          password: 'hash',
          accessToken: null,
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'acc2',
          accountId: 'acc2',
          providerId: 'github',
          userId: 'u1',
          password: null,
          accessToken: 'token',
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
      ])

      const { inArray } = await import('drizzle-orm')
      await accountRepository.deleteMany(inArray(account.id, ['acc1', 'acc2']))

      const remaining = await accountRepository.findAll()
      expect(remaining).toHaveLength(0)
    })

    it('deletes accounts matching condition', async () => {
      const now = new Date()
      await accountRepository.createMany([
        {
          id: 'acc1',
          accountId: 'acc1',
          providerId: 'credential',
          userId: 'u1',
          password: 'hash',
          accessToken: null,
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'acc2',
          accountId: 'acc2',
          providerId: 'github',
          userId: 'u1',
          password: null,
          accessToken: 'token',
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
      ])

      await accountRepository.deleteMany(eq(account.providerId, 'github'))

      const remaining = await accountRepository.findAll()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].providerId).toBe('credential')
    })
  })

  describe('exists', () => {
    it('returns true when account exists', async () => {
      const now = new Date()
      await accountRepository.create({
        id: 'acc1',
        accountId: 'test@example.com',
        providerId: 'credential',
        userId: 'u1',
        password: 'hash',
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      })

      const exists = await accountRepository.exists(eq(account.accountId, 'test@example.com'))

      expect(exists).toBe(true)
    })

    it('returns false when account does not exist', async () => {
      const exists = await accountRepository.exists(eq(account.accountId, 'nonexistent'))

      expect(exists).toBe(false)
    })
  })

  describe('count', () => {
    it('returns total account count', async () => {
      const now = new Date()
      await accountRepository.createMany([
        {
          id: 'acc1',
          accountId: 'acc1',
          providerId: 'credential',
          userId: 'u1',
          password: 'hash',
          accessToken: null,
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'acc2',
          accountId: 'acc2',
          providerId: 'github',
          userId: 'u1',
          password: null,
          accessToken: 'token',
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
      ])

      const count = await accountRepository.count()

      expect(count).toBe(2)
    })

    it('returns count with where clause', async () => {
      const now = new Date()
      await accountRepository.createMany([
        {
          id: 'acc1',
          accountId: 'acc1',
          providerId: 'credential',
          userId: 'u1',
          password: 'hash',
          accessToken: null,
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'acc2',
          accountId: 'acc2',
          providerId: 'github',
          userId: 'u1',
          password: null,
          accessToken: 'token',
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: now,
          updatedAt: now,
        },
      ])

      const count = await accountRepository.count(eq(account.providerId, 'github'))

      expect(count).toBe(1)
    })

    it('returns 0 when no accounts match', async () => {
      const count = await accountRepository.count(eq(account.providerId, 'nonexistent'))

      expect(count).toBe(0)
    })
  })
})

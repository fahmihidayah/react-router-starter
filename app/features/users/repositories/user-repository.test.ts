import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { userRepository } from './repositories'
import { db } from '~/lib/database'
import { user } from '~/db/schema'
import { like } from 'drizzle-orm/sql'

describe('UserRepository', () => {
  // Seed a known state before each test
  beforeEach(async () => {
    await db.insert(user).values([
      {
        id: 'u1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'u2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        emailVerified: false,
        image: null,
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02'),
      },
      {
        id: 'u3',
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date('2025-01-03'),
        updatedAt: new Date('2025-01-03'),
      },
    ])
  })

  // Clean up after each test
  afterEach(async () => {
    await db.delete(user)
  })

  describe('findById', () => {
    it('returns the user when it exists', async () => {
      const result = await userRepository.findById('u1')

      expect(result).toMatchObject({
        id: 'u1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
      })
    })

    it('returns null when user does not exist', async () => {
      const result = await userRepository.findById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('findAll', () => {
    it('returns all users', async () => {
      const result = await userRepository.findAll()

      expect(result).toHaveLength(3)
      expect(result.map((u) => u.id)).toEqual(
        expect.arrayContaining(['u1', 'u2', 'u3'])
      )
    })

    it('returns empty array when no users exist', async () => {
      await db.delete(user)
      const result = await userRepository.findAll()

      expect(result).toEqual([])
    })
  })

  describe('findManyPaginated', () => {
    it('returns paginated results with correct metadata', async () => {
      const result = await userRepository.findManyPaginated({
        page: 1,
        pageSize: 2,
      })

      expect(result.data).toHaveLength(2)
      expect(result.pagination.totalItems).toBe(3)
      expect(result.pagination.totalPages).toBe(2)
      expect(result.pagination.currentPage).toBe(1)
    })

    it('returns correct page 2 results', async () => {
      const result = await userRepository.findManyPaginated({
        page: 2,
        pageSize: 2,
      })

      expect(result.data).toHaveLength(1)
      expect(result.pagination.currentPage).toBe(2)
      expect(result.pagination.totalPages).toBe(2)
    })

    it('filters results with where clause', async () => {
      const result = await userRepository.findManyPaginated({
        where: like(user.name, '%Charlie%'),
        page: 1,
        pageSize: 10,
      })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].name).toBe('Charlie Brown')
    })

    it('returns empty results when filter matches nothing', async () => {
      const result = await userRepository.findManyPaginated({
        where: like(user.name, '%NonExistent%'),
        page: 1,
        pageSize: 10,
      })

      expect(result.data).toHaveLength(0)
      expect(result.pagination.totalItems).toBe(0)
      expect(result.pagination.totalPages).toBe(0)
    })
  })

  describe('create', () => {
    it('creates and returns the new user', async () => {
      const newUser = {
        id: 'u4',
        name: 'Diana Prince',
        email: 'diana@example.com',
        emailVerified: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const result = await userRepository.create(newUser)

      expect(result).toMatchObject({
        id: 'u4',
        name: 'Diana Prince',
        email: 'diana@example.com',
      })

      // Verify it's persisted
      const found = await userRepository.findById('u4')
      expect(found).toMatchObject(newUser)
    })

    it('persists the created user in database', async () => {
      const newUser = {
        id: 'u5',
        name: 'Eve Wilson',
        email: 'eve@example.com',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await userRepository.create(newUser)

      const allUsers = await userRepository.findAll()
      expect(allUsers).toHaveLength(4)
    })
  })

  describe('update', () => {
    it('updates user fields and returns the updated user', async () => {
      const updateData = {
        name: 'Alice Updated',
        email: 'alice.updated@example.com',
        updatedAt: new Date(),
      }
      const result = await userRepository.update('u1', updateData)

      expect(result).toMatchObject({
        id: 'u1',
        name: 'Alice Updated',
        email: 'alice.updated@example.com',
      })
    })

    it('persists updates to database', async () => {
      await userRepository.update('u1', {
        name: 'Alice Changed',
        updatedAt: new Date(),
      })

      const updated = await userRepository.findById('u1')
      expect(updated?.name).toBe('Alice Changed')
    })

    it('updates only specified fields', async () => {
      const originalEmail = 'alice@example.com'
      await userRepository.update('u1', {
        name: 'Alice Changed',
        updatedAt: new Date(),
      })

      const updated = await userRepository.findById('u1')
      expect(updated?.email).toBe(originalEmail)
    })
  })

  describe('delete', () => {
    it('removes the user', async () => {
      await userRepository.delete('u1')

      const result = await userRepository.findById('u1')
      expect(result).toBeNull()
    })

    it('reduces total user count', async () => {
      const beforeCount = (await userRepository.findAll()).length
      await userRepository.delete('u1')
      const afterCount = (await userRepository.findAll()).length

      expect(afterCount).toBe(beforeCount - 1)
    })
  })

  describe('deleteMany', () => {
    it('removes multiple users by ID', async () => {
      const { inArray } = await import('drizzle-orm')
      await userRepository.deleteMany(inArray(user.id, ['u1', 'u2']))

      const remaining = await userRepository.findAll()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe('u3')
    })

    it('returns failure when given empty array', async () => {
      const { inArray } = await import('drizzle-orm')
      const beforeCount = (await userRepository.findAll()).length
      await userRepository.deleteMany(inArray(user.id, []))

      const afterCount = (await userRepository.findAll()).length
      expect(afterCount).toBe(beforeCount)
    })

    it('deletes all selected users', async () => {
      const { inArray } = await import('drizzle-orm')
      await userRepository.deleteMany(inArray(user.id, ['u1', 'u2', 'u3']))

      const remaining = await userRepository.findAll()
      expect(remaining).toHaveLength(0)
    })
  })
})

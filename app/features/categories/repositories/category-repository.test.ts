import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { categoryRepository } from './category-repository'
import { db } from '~/lib/database'
import { categories } from '~/db/schema'
import { like } from 'drizzle-orm'

describe('CategoryRepository', () => {
  beforeEach(async () => {
    await db.insert(categories).values([
      { id: 'c1', title: 'Electronics', createdAt: new Date(), updatedAt: new Date() },
      { id: 'c2', title: 'Books', createdAt: new Date(), updatedAt: new Date() },
      { id: 'c3', title: 'Electronics Accessories', createdAt: new Date(), updatedAt: new Date() },
    ])
  })

  afterEach(async () => {
    await db.delete(categories)
  })

  describe('findById', () => {
    it('returns the category when it exists', async () => {
      const result = await categoryRepository.findById('c1')

      expect(result).toMatchObject({ id: 'c1', title: 'Electronics' })
    })

    it('returns undefined when category does not exist', async () => {
      const result = await categoryRepository.findById('nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('findManyPaginated', () => {
    it('returns paginated results with correct metadata', async () => {
      const result = await categoryRepository.findManyPaginated({
        page: 1,
        limit: 2,
      })

      expect(result.docs).toHaveLength(2)
      expect(result.totalDocs).toBe(3)
      expect(result.totalPages).toBe(2)
    })

    it('filters results with where clause', async () => {
      const result = await categoryRepository.findManyPaginated({
        where: like(categories.title, '%Electronics%'),
        page: 1,
        limit: 10,
      })

      expect(result.docs).toHaveLength(2)
      expect(result.docs.every((c) => c.title.includes('Electronics'))).toBe(true)
    })
  })

  describe('create', () => {
    it('creates and returns the new category', async () => {
      const result = await categoryRepository.create({
        id: 'c4',
        title: 'New Category',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      expect(result).toMatchObject({ id: 'c4', title: 'New Category' })

      const found = await categoryRepository.findById('c4')
      expect(found).toMatchObject({ id: 'c4', title: 'New Category' })
    })
  })

  describe('update', () => {
    it('updates a category and returns success', async () => {
      await categoryRepository.update('c1', { title: 'Updated Electronics', updatedAt: new Date() })

      const result = await categoryRepository.findById('c1')
      expect(result?.title).toBe('Updated Electronics')
    })
  })

  describe('delete', () => {
    it('removes the category', async () => {
      await categoryRepository.delete('c1')

      const result = await categoryRepository.findById('c1')
      expect(result).toBeUndefined()
    })
  })

  describe('deleteMany', () => {
    it('removes multiple categories by ID', async () => {
      const { inArray } = await import('drizzle-orm')
      await categoryRepository.deleteMany(inArray(categories.id, ['c1', 'c2']))

      const remaining = await categoryRepository.findAll()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe('c3')
    })
  })
})

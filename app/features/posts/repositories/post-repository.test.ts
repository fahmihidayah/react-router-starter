import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { postRepository } from './post-repository'
import { db } from '~/lib/database'
import { posts, categories } from '~/db/schema'

describe('PostRepository', () => {
  const timestamp = Date.now()
  const catId1 = `cat-${timestamp}-1`
  const catId2 = `cat-${timestamp}-2`
  const postId1 = `post-${timestamp}-1`
  const postId2 = `post-${timestamp}-2`
  const postId3 = `post-${timestamp}-3`

  beforeEach(async () => {
    // Insert test categories first
    await db.insert(categories).values([
      { id: catId1, title: 'Technology', createdAt: new Date(), updatedAt: new Date() },
      { id: catId2, title: 'Lifestyle', createdAt: new Date(), updatedAt: new Date() },
    ])

    // Insert test posts
    await db.insert(posts).values([
      {
        id: postId1,
        slug: `slug-${timestamp}-1`,
        title: 'First Post',
        content: 'Content for first post',
        categoryId: catId1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: postId2,
        slug: `slug-${timestamp}-2`,
        title: 'Second Post',
        content: 'Content for second post',
        categoryId: catId1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: postId3,
        slug: `slug-${timestamp}-3`,
        title: 'Lifestyle Post',
        content: 'Content for lifestyle post',
        categoryId: catId2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  })

  afterEach(async () => {
    // Delete posts first due to foreign key constraint
    const { inArray } = await import('drizzle-orm')
    await db.delete(posts).where(inArray(posts.id, [postId1, postId2, postId3]))
    await db.delete(categories).where(inArray(categories.id, [catId1, catId2]))
  })

  describe('findById', () => {
    it('returns the post when it exists', async () => {
      const result = await postRepository.findById(postId1)

      expect(result).toMatchObject({
        id: postId1,
        title: 'First Post',
      })
    })

    it('returns undefined when post does not exist', async () => {
      const result = await postRepository.findById('nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('findBySlug', () => {
    it('returns the post when slug exists', async () => {
      const result = await postRepository.findBySlug(`slug-${timestamp}-1`)

      expect(result).toMatchObject({
        id: postId1,
        title: 'First Post',
      })
    })

    it('returns undefined when slug does not exist', async () => {
      const result = await postRepository.findBySlug('nonexistent-slug')

      expect(result).toBeUndefined()
    })
  })

  describe('slugExists', () => {
    it('returns true when slug exists', async () => {
      const result = await postRepository.slugExists(`slug-${timestamp}-1`)

      expect(result).toBe(true)
    })

    it('returns false when slug does not exist', async () => {
      const result = await postRepository.slugExists('nonexistent-slug')

      expect(result).toBe(false)
    })
  })

  describe('findWithFilter', () => {
    it('returns paginated results with correct metadata', async () => {
      const result = await postRepository.findWithFilter({
        page: 1,
        limit: 2,
      })

      // May have more than 3 if other tests leave data, check at least our 3 are there
      expect(result.docs.length).toBeGreaterThanOrEqual(2)
      expect(result.totalDocs).toBeGreaterThanOrEqual(3)
    })

    it('filters results by category', async () => {
      const result = await postRepository.findWithFilter({
        categoryId: catId1,
        page: 1,
        limit: 10,
      })

      // Should have at least our 2 posts
      expect(result.docs.filter((p) => p.categoryId === catId1).length).toBeGreaterThanOrEqual(2)
    })

    it('filters results by search term', async () => {
      const result = await postRepository.findWithFilter({
        search: 'Lifestyle',
        page: 1,
        limit: 10,
      })

      // Should contain our lifestyle post
      expect(result.docs.some((p) => p.id === postId3)).toBe(true)
    })

    it('filters by both category and search term', async () => {
      const result = await postRepository.findWithFilter({
        categoryId: catId1,
        search: 'First',
        page: 1,
        limit: 10,
      })

      // Should find the First Post in cat1
      expect(result.docs.some((p) => p.id === postId1 && p.title === 'First Post')).toBe(true)
    })
  })

  describe('create', () => {
    it('creates and returns the new post', async () => {
      const newPostId = `post-${timestamp}-new`
      const result = await postRepository.create({
        id: newPostId,
        slug: `slug-${timestamp}-new`,
        title: 'New Post',
        content: 'New content',
        categoryId: catId1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      expect(result).toMatchObject({
        id: newPostId,
        slug: `slug-${timestamp}-new`,
        title: 'New Post',
      })

      const found = await postRepository.findById(newPostId)
      expect(found).toMatchObject({ id: newPostId, title: 'New Post' })
    })

    it('creates post with JSON content from Lexical editor', async () => {
      const newPostId = `post-${timestamp}-json`
      const jsonContent = JSON.stringify({
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 1,
                  mode: 'normal',
                  style: '',
                  text: 'Bold text',
                  type: 'text',
                  version: 1,
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            }
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        }
      })

      await postRepository.create({
        id: newPostId,
        slug: `slug-${timestamp}-json`,
        title: 'JSON Post',
        content: jsonContent,
        categoryId: catId1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const found = await postRepository.findById(newPostId)
      expect(found?.content).toBe(jsonContent)

      // Verify content is valid JSON
      expect(() => JSON.parse(found?.content || '{}')).not.toThrow()
    })
  })

  describe('update', () => {
    it('updates a post and returns success', async () => {
      await postRepository.update(postId1, {
        title: 'Updated First Post',
        updatedAt: new Date(),
      })

      const result = await postRepository.findById(postId1)
      expect(result?.title).toBe('Updated First Post')
    })

    it('updates post content with JSON from Lexical editor', async () => {
      const updatedJsonContent = JSON.stringify({
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Updated content with formatting',
                  type: 'text',
                  version: 1,
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            }
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        }
      })

      await postRepository.update(postId1, {
        content: updatedJsonContent,
        updatedAt: new Date(),
      })

      const result = await postRepository.findById(postId1)
      expect(result?.content).toBe(updatedJsonContent)
      expect(() => JSON.parse(result?.content || '{}')).not.toThrow()
    })
  })

  describe('delete', () => {
    it('removes the post', async () => {
      await postRepository.delete(postId1)

      const result = await postRepository.findById(postId1)
      expect(result).toBeUndefined()
    })
  })

  describe('deleteMany', () => {
    it('removes multiple posts by ID', async () => {
      const { inArray } = await import('drizzle-orm')
      await postRepository.deleteMany(inArray(posts.id, [postId1, postId2]))

      const found1 = await postRepository.findById(postId1)
      const found2 = await postRepository.findById(postId2)
      expect(found1).toBeUndefined()
      expect(found2).toBeUndefined()
    })
  })
})

import { describe, it, expect } from 'vitest'
import {
  createPostSchema,
  updatePostSchema,
  postFilterSchema,
  type TCreatePost,
  type TUpdatePost,
  type TPostFilter,
} from './post-schema'

describe('createPostSchema', () => {
  it('validates a valid create post object with plain text', () => {
    const data = {
      title: 'My First Post',
      content: 'This is the content of my post',
      categoryId: 'cat-123',
    }

    const result = createPostSchema.safeParse(data)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(data)
    }
  })

  it('validates a valid create post object with JSON content from Lexical', () => {
    const jsonContent = JSON.stringify({
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Post content',
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

    const data = {
      title: 'My First Post',
      content: jsonContent,
      categoryId: 'cat-123',
    }

    const result = createPostSchema.safeParse(data)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(data)
      // Verify content is valid JSON
      expect(() => JSON.parse(result.data.content)).not.toThrow()
    }
  })

  it('rejects when title is empty', () => {
    const data = {
      title: '',
      content: 'Content here',
      categoryId: 'cat-123',
    }

    const result = createPostSchema.safeParse(data)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title).toBeDefined()
    }
  })

  it('rejects when title exceeds max length', () => {
    const data = {
      title: 'a'.repeat(256),
      content: 'Content here',
      categoryId: 'cat-123',
    }

    const result = createPostSchema.safeParse(data)

    expect(result.success).toBe(false)
  })

  it('rejects when content is empty', () => {
    const data = {
      title: 'Valid Title',
      content: '',
      categoryId: 'cat-123',
    }

    const result = createPostSchema.safeParse(data)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.content).toBeDefined()
    }
  })

  it('rejects when categoryId is empty', () => {
    const data = {
      title: 'Valid Title',
      content: 'Valid content',
      categoryId: '',
    }

    const result = createPostSchema.safeParse(data)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.categoryId).toBeDefined()
    }
  })

  it('rejects when required fields are missing', () => {
    const data = {
      title: 'Valid Title',
    }

    const result = createPostSchema.safeParse(data)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(Object.keys(result.error.flatten().fieldErrors).length).toBeGreaterThan(1)
    }
  })
})

describe('updatePostSchema', () => {
  it('validates a valid update post object with plain text', () => {
    const data = {
      title: 'Updated Post',
      content: 'Updated content',
      categoryId: 'cat-456',
    }

    const result = updatePostSchema.safeParse(data)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(data)
    }
  })

  it('validates a valid update post object with JSON content', () => {
    const jsonContent = JSON.stringify({
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Updated JSON content',
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

    const data = {
      title: 'Updated Post',
      content: jsonContent,
      categoryId: 'cat-456',
    }

    const result = updatePostSchema.safeParse(data)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(data)
      expect(() => JSON.parse(result.data.content)).not.toThrow()
    }
  })

  it('applies same validation rules as createPostSchema', () => {
    const invalidData = {
      title: '',
      content: '',
      categoryId: '',
    }

    const createResult = createPostSchema.safeParse(invalidData)
    const updateResult = updatePostSchema.safeParse(invalidData)

    expect(createResult.success).toBe(false)
    expect(updateResult.success).toBe(false)
  })
})

describe('postFilterSchema', () => {
  it('validates with default values', () => {
    const data = {}

    const result = postFilterSchema.safeParse(data)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(10)
      expect(result.data.categoryId).toBeUndefined()
      expect(result.data.search).toBeUndefined()
    }
  })

  it('validates with all optional fields', () => {
    const data = {
      categoryId: 'cat-123',
      search: 'javascript',
      page: 2,
      limit: 20,
    }

    const result = postFilterSchema.safeParse(data)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(data)
    }
  })

  it('coerces string page to number', () => {
    const data = {
      page: '3',
      limit: '15',
    }

    const result = postFilterSchema.safeParse(data)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(3)
      expect(result.data.limit).toBe(15)
      expect(typeof result.data.page).toBe('number')
    }
  })

  it('rejects page less than 1', () => {
    const data = {
      page: 0,
    }

    const result = postFilterSchema.safeParse(data)

    expect(result.success).toBe(false)
  })

  it('rejects limit greater than 100', () => {
    const data = {
      limit: 101,
    }

    const result = postFilterSchema.safeParse(data)

    expect(result.success).toBe(false)
  })

  it('rejects non-integer page values', () => {
    const data = {
      page: 1.5,
    }

    const result = postFilterSchema.safeParse(data)

    expect(result.success).toBe(false)
  })
})

describe('createSlugFrom utility in schemas', () => {
  // This test ensures the slug function is importable from utils
  it('imports createSlugFrom successfully', async () => {
    const { createSlugFrom } = await import('~/utils/slug')
    expect(typeof createSlugFrom).toBe('function')
  })
})

import { describe, it, expect } from 'vitest'
import { createSlugFrom } from './slug'

describe('createSlugFrom', () => {
  it('converts text to lowercase', () => {
    const result = createSlugFrom('Hello World')
    expect(result).toBe('hello-world')
  })

  it('replaces spaces with dashes', () => {
    const result = createSlugFrom('My Great Title')
    expect(result).toBe('my-great-title')
  })

  it('handles multiple consecutive spaces', () => {
    const result = createSlugFrom('Title   With    Spaces')
    expect(result).toBe('title-with-spaces')
  })

  it('removes special characters', () => {
    const result = createSlugFrom('Hello! World?')
    expect(result).toBe('hello-world')
  })

  it('removes special characters but keeps dashes and underscores', () => {
    const result = createSlugFrom('Hello-World_Test')
    expect(result).toBe('hello-world_test')
  })

  it('trims whitespace from start and end', () => {
    const result = createSlugFrom('  Spaced Title  ')
    expect(result).toBe('spaced-title')
  })

  it('handles numbers correctly', () => {
    const result = createSlugFrom('Post 123 Title')
    expect(result).toBe('post-123-title')
  })

  it('handles already slugged text', () => {
    const result = createSlugFrom('already-slugged-text')
    expect(result).toBe('already-slugged-text')
  })

  it('removes punctuation', () => {
    const result = createSlugFrom('Hello, World!')
    expect(result).toBe('hello-world')
  })

  it('handles unicode characters by removing them', () => {
    const result = createSlugFrom('Café & Restaurant')
    expect(result).toBe('caf-restaurant')
  })

  it('returns empty string for special characters only', () => {
    const result = createSlugFrom('!!!###$$$')
    expect(result).toBe('')
  })

  it('handles apostrophes and quotes', () => {
    const result = createSlugFrom("It's a wonderful day")
    expect(result).toBe('its-a-wonderful-day')
  })

  it('handles ampersands', () => {
    const result = createSlugFrom('Salt & Pepper')
    expect(result).toBe('salt-pepper')
  })

  it('produces consistent results', () => {
    const text = 'Test Title With Spaces'
    const result1 = createSlugFrom(text)
    const result2 = createSlugFrom(text)
    expect(result1).toBe(result2)
  })
})

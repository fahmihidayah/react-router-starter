import { describe, expect, it } from 'vitest'
import { addLearnerAccessSchema } from './learner-schema'

describe('addLearnerAccessSchema', () => {
  it('normalizes an email and accepts an assignable role', () => {
    const result = addLearnerAccessSchema.parse({
      email: '  Parent@Example.com ',
      role: 'parent',
    })

    expect(result).toEqual({ email: 'parent@example.com', role: 'parent' })
  })

  it('rejects invalid email addresses and the owner role', () => {
    const result = addLearnerAccessSchema.safeParse({ email: 'invalid', role: 'owner' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined()
      expect(result.error.flatten().fieldErrors.role).toBeDefined()
    }
  })
})

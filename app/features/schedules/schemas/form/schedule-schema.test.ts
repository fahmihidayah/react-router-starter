import { describe, expect, it } from 'vitest'
import {
  addScheduleTodoSchema,
  moveScheduleTodoSchema,
  saveSchedulePlanSchema,
} from './schedule-schema'

const goalId = 'c03e4c93-3631-4a51-9597-6d3373081352'

describe('schedule form schemas', () => {
  it('accepts a valid repeating plan and coerces planned minutes', () => {
    const result = saveSchedulePlanSchema.safeParse({
      startsOn: '2026-10-07',
      timezone: 'Asia/Jakarta',
      items: [{ sourceType: 'goal', sourceId: goalId, plannedDurationMinutes: '60' }],
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.items[0].plannedDurationMinutes).toBe(60)
  })

  it('requires at least one item in a repeating plan', () => {
    expect(
      saveSchedulePlanSchema.safeParse({
        startsOn: '2026-10-07',
        timezone: 'Asia/Jakarta',
        items: [],
      }).success,
    ).toBe(false)
  })

  it('rejects impossible dates and invalid source identifiers', () => {
    const result = addScheduleTodoSchema.safeParse({
      scheduledDate: '2026-02-31',
      sourceType: 'goal',
      sourceId: 'not-a-uuid',
      plannedDurationMinutes: 30,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.scheduledDate).toBeDefined()
      expect(result.error.flatten().fieldErrors.sourceId).toBeDefined()
    }
  })

  it('enforces the daily duration range', () => {
    const base = {
      scheduledDate: '2026-10-07',
      sourceType: 'goal',
      sourceId: goalId,
    }
    expect(addScheduleTodoSchema.safeParse({ ...base, plannedDurationMinutes: 0 }).success).toBe(
      false,
    )
    expect(addScheduleTodoSchema.safeParse({ ...base, plannedDurationMinutes: 1441 }).success).toBe(
      false,
    )
  })

  it('allows only adjacent move directions', () => {
    expect(moveScheduleTodoSchema.safeParse({ direction: 'up' }).success).toBe(true)
    expect(moveScheduleTodoSchema.safeParse({ direction: 'down' }).success).toBe(true)
    expect(moveScheduleTodoSchema.safeParse({ direction: 'left' }).success).toBe(false)
  })
})

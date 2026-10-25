import { describe, expect, it } from 'vitest'
import { createActivitySchema, createTrackSchema } from './activity-schema'

describe('activity schemas', () => {
  it('accepts a goal-free activity assigned to a topic', () => {
    const result = createActivitySchema.parse({
      title: '  Read an Arabic book  ',
      activityDate: '2026-10-03',
      durationMinutes: '30',
      value: '30',
      unit: 'minutes',
      trackId: '3d733783-98d5-4fc7-b31c-2120fdc58c42',
      note: '  Chapter one  ',
    })

    expect(result).toEqual({
      title: 'Read an Arabic book',
      activityDate: '2026-10-03',
      durationMinutes: 30,
      value: 30,
      unit: 'minutes',
      trackId: '3d733783-98d5-4fc7-b31c-2120fdc58c42',
      note: 'Chapter one',
    })
  })

  it('allows journaling without a duration', () => {
    const result = createActivitySchema.parse({
      title: 'Wrote one page',
      activityDate: '2026-10-03',
      durationMinutes: '',
      value: '',
      unit: '',
      note: '',
      trackId: '3d733783-98d5-4fc7-b31c-2120fdc58c42',
    })

    expect(result.value).toBeUndefined()
    expect(result.unit).toBeUndefined()
    expect(result.durationMinutes).toBeUndefined()
    expect(result.trackId).toBe('3d733783-98d5-4fc7-b31c-2120fdc58c42')
  })

  it('rejects empty track names and zero-minute durations', () => {
    expect(createTrackSchema.safeParse({ name: '  ' }).success).toBe(false)
    expect(
      createActivitySchema.safeParse({
        title: 'Practice',
        activityDate: '2026-10-03',
        durationMinutes: '0',
        value: '0',
        unit: 'minutes',
        trackId: '',
        note: '',
      }).success,
    ).toBe(false)
  })
})

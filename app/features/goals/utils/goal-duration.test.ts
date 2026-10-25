import { describe, expect, it } from 'vitest'
import { calculateGoalEndDate, isGoalDateValue } from './goal-duration'

describe('calculateGoalEndDate', () => {
  it('uses an inclusive duration for days', () => {
    expect(calculateGoalEndDate('2026-10-06', 1, 'days')).toBe('2026-10-06')
    expect(calculateGoalEndDate('2026-10-06', 30, 'days')).toBe('2026-11-04')
  })

  it('calculates calendar-month durations across years', () => {
    expect(calculateGoalEndDate('2026-10-06', 3, 'months')).toBe('2027-01-05')
  })

  it('clamps calendar-month durations to shorter months', () => {
    expect(calculateGoalEndDate('2027-01-31', 1, 'months')).toBe('2027-02-27')
  })

  it('rejects malformed and impossible dates', () => {
    expect(isGoalDateValue('2026-02-30')).toBe(false)
    expect(isGoalDateValue('October 6, 2026')).toBe(false)
  })
})

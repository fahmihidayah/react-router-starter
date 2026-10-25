import { describe, expect, it } from 'vitest'
import {
  addDays,
  dateKeyInTimeZone,
  enumerateDates,
  isDateKey,
  monthRange,
  weekRange,
} from './date-range'

describe('schedule date utilities', () => {
  it('validates real calendar dates', () => {
    expect(isDateKey('2026-10-07')).toBe(true)
    expect(isDateKey('2026-02-29')).toBe(false)
    expect(isDateKey('07-10-2026')).toBe(false)
  })

  it('derives the date in the learner schedule timezone', () => {
    const instant = new Date('2026-10-06T18:00:00.000Z')
    expect(dateKeyInTimeZone(instant, 'Asia/Jakarta')).toBe('2026-10-07')
    expect(dateKeyInTimeZone(instant, 'America/New_York')).toBe('2026-10-06')
  })

  it('adds and enumerates dates across month boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(enumerateDates('2026-10-30', '2026-11-02')).toEqual([
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
    ])
  })

  it('builds Monday-to-Sunday week ranges', () => {
    expect(weekRange('2026-10-07')).toEqual({ start: '2026-10-05', end: '2026-10-11' })
    expect(weekRange('2026-10-11')).toEqual({ start: '2026-10-05', end: '2026-10-11' })
  })

  it('builds calendar month ranges including leap years', () => {
    expect(monthRange('2026-10-07')).toEqual({ start: '2026-10-01', end: '2026-10-31' })
    expect(monthRange('2028-02-20')).toEqual({ start: '2028-02-01', end: '2028-02-29' })
  })
})

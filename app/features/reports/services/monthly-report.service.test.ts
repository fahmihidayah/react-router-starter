import { describe, expect, it } from 'vitest'
import { buildMonthlyLearnerReport, resolveReportMonth } from './monthly-report.service'

describe('monthly learner report', () => {
  it('uses the current month for invalid or future selections', () => {
    const createdAt = new Date('2026-09-10T08:00:00.000Z')

    expect(resolveReportMonth('not-a-month', '2026-10-05', createdAt).month).toBe('2026-10')
    expect(resolveReportMonth('2027-01', '2026-10-05', createdAt).month).toBe('2026-10')
    expect(resolveReportMonth('2026-01', '2026-10-05', createdAt).month).toBe('2026-09')
  })

  it('measures unique logging days instead of rewarding multiple records in one day', () => {
    const report = buildMonthlyLearnerReport({
      requestedMonth: '2026-10',
      today: '2026-10-05',
      learnerCreatedAt: new Date('2026-09-10T08:00:00.000Z'),
      goals: [
        {
          id: 'goal-1',
          title: 'Read books',
          unit: 'pages',
          startDate: new Date('2026-09-01T00:00:00.000Z'),
          endDate: new Date('2026-12-31T00:00:00.000Z'),
          entries: [
            {
              id: 'entry-1',
              activityDate: new Date('2026-10-01T00:00:00.000Z'),
              value: 4,
              durationMinutes: 20,
            },
            {
              id: 'entry-2',
              activityDate: new Date('2026-10-01T00:00:00.000Z'),
              value: 6,
              durationMinutes: null,
            },
          ],
        },
      ] as never,
      tracks: [
        {
          id: 'track-1',
          name: 'Math',
          createdAt: new Date('2026-09-01T00:00:00.000Z'),
          archivedAt: null,
        },
        {
          id: 'track-2',
          name: 'Writing',
          createdAt: new Date('2026-10-04T00:00:00.000Z'),
          archivedAt: null,
        },
      ] as never,
      activities: [
        {
          id: 'activity-1',
          trackId: 'track-1',
          trackName: 'Math',
          goalId: null,
          activityDate: new Date('2026-10-03T00:00:00.000Z'),
          durationMinutes: 30,
        },
        {
          id: 'activity-2',
          trackId: 'track-1',
          trackName: 'Math',
          goalId: null,
          activityDate: new Date('2026-10-05T00:00:00.000Z'),
          durationMinutes: 15,
        },
      ] as never,
    })

    expect(report).toMatchObject({
      month: '2026-10',
      eligibleDays: 5,
      activeDays: 3,
      trackingPercentage: 60,
      totalRecords: 4,
    })
    expect(report.goalItems[0]).toMatchObject({
      recordCount: 2,
      activeDays: 1,
      durationMinutes: 20,
      value: 10,
      unit: 'pages',
    })
    expect(report.trackItems).toEqual([
      expect.objectContaining({ name: 'Math', recordCount: 2, activeDays: 2 }),
      expect.objectContaining({ name: 'Writing', recordCount: 0, activeDays: 0 }),
    ])
  })

  it('does not count days before the learner was created', () => {
    const report = buildMonthlyLearnerReport({
      requestedMonth: '2026-09',
      today: '2026-10-05',
      learnerCreatedAt: new Date('2026-09-10T14:00:00.000Z'),
      goals: [],
      tracks: [],
      activities: [],
    })

    expect(report.eligibleDays).toBe(21)
    expect(report.trackingPercentage).toBe(0)
  })
})

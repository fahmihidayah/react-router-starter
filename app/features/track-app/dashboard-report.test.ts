import { describe, expect, it } from 'vitest'
import { buildDashboardGoalReport } from './dashboard-report'
import type { DashboardLearner } from './types'

const day = (value: string) => new Date(`${value}T00:00:00.000Z`)

function learner(
  id: string,
  role: DashboardLearner['role'],
  goals: DashboardLearner['goals'],
): DashboardLearner {
  return {
    id,
    name: id,
    avatar: null,
    dateOfBirth: null,
    createdAt: day('2026-01-01'),
    updatedAt: day('2026-01-01'),
    groupId: null,
    groupName: null,
    role,
    goals,
  }
}

function goal(
  id: string,
  endDate: string,
  currentValue: number,
  entryDates: string[] = [],
): DashboardLearner['goals'][number] {
  return {
    id,
    learnerId: 'learner',
    groupId: null,
    title: id,
    description: null,
    targetValue: 10,
    unit: 'pages',
    startDate: day('2026-10-01'),
    endDate: day(endDate),
    createdAt: day('2026-10-01'),
    updatedAt: day('2026-10-01'),
    currentValue,
    entries: entryDates.map((date, index) => ({
      id: `entry-${id}-${index}`,
      learnerId: 'learner',
      trackId: null,
      scheduleTodoId: null,
      recordedByUserId: 'user',
      activityDate: day(date),
      title: id,
      durationMinutes: null,
      unit: 'pages',
      note: null,
      createdAt: day(date),
      updatedAt: day(date),
      goalId: id,
      value: 1,
      recordedByName: 'Teacher',
    })),
  }
}

describe('dashboard goal report', () => {
  it('counts today updates, excludes viewers, and sorts attention by deadline', () => {
    const report = buildDashboardGoalReport(
      [
        learner('learner-1', 'teacher', [
          goal('later', '2026-10-20', 2),
          goal('updated', '2026-10-15', 3, ['2026-10-04']),
          goal('sooner', '2026-10-05', 1),
          goal('completed-today', '2026-10-10', 10, ['2026-10-04']),
        ]),
        learner('viewer-learner', 'viewer', [goal('viewer-goal', '2026-10-05', 0)]),
      ],
      '2026-10-04',
    )

    expect(report.expectedGoalCount).toBe(4)
    expect(report.updatedGoalCount).toBe(2)
    expect(report.learnersNeedingAttention).toBe(1)
    expect(report.attentionItems.map((item) => item.goal.id)).toEqual(['sooner', 'later'])
  })

  it('ignores future, expired, and previously completed goals', () => {
    const future = goal('future', '2026-11-10', 0)
    future.startDate = day('2026-11-01')
    const expired = goal('expired', '2026-10-03', 0)
    const completedEarlier = goal('completed-earlier', '2026-10-10', 10, ['2026-10-02'])

    const report = buildDashboardGoalReport(
      [learner('learner-1', 'owner', [future, expired, completedEarlier])],
      '2026-10-04',
    )

    expect(report.expectedGoalCount).toBe(0)
    expect(report.attentionItems).toEqual([])
  })
})

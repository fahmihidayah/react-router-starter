// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import type { DashboardLearner, DashboardLearnerSchedule } from '../types'
import { DashboardTodaySchedule } from './dashboard-today-schedule'

afterEach(cleanup)

describe('DashboardTodaySchedule', () => {
  it('shows every scheduled todo and the learner completion summary', () => {
    const now = new Date('2026-10-08T00:00:00.000Z')
    const learners = [
      {
        id: 'learner-1',
        name: 'Fahmi',
        avatar: null,
        dateOfBirth: null,
        createdAt: now,
        updatedAt: now,
        groupId: null,
        groupName: null,
        role: 'owner',
        goals: [],
      } satisfies DashboardLearner,
    ]
    const schedules = [
      {
        learnerId: 'learner-1',
        todos: [
          {
            id: 'todo-1',
            titleSnapshot: 'Read Atomic Habits',
            plannedDurationMinutes: 60,
            completed: true,
          },
          {
            id: 'todo-2',
            titleSnapshot: 'Exercise',
            plannedDurationMinutes: 25,
            completed: false,
          },
        ],
      } as DashboardLearnerSchedule,
    ]

    render(
      <MemoryRouter>
        <DashboardTodaySchedule learners={learners} schedules={schedules} today="2026-10-08" />
      </MemoryRouter>,
    )

    expect(screen.getByText("Today's schedule")).toBeTruthy()
    expect(screen.getByText('Fahmi')).toBeTruthy()
    expect(screen.getByText('Read Atomic Habits')).toBeTruthy()
    expect(screen.getByText('Exercise')).toBeTruthy()
    expect(screen.getAllByText(/1 of 2 complete/)).toHaveLength(2)
    expect(screen.getByText(/85 min/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open 2026-10-08' }).getAttribute('href')).toContain(
      'learnerId=learner-1',
    )
  })

  it('shows a useful empty state when no learner has work today', () => {
    render(
      <MemoryRouter>
        <DashboardTodaySchedule learners={[]} schedules={[]} today="2026-10-08" />
      </MemoryRouter>,
    )
    expect(screen.getByText('Nothing scheduled today')).toBeTruthy()
  })
})

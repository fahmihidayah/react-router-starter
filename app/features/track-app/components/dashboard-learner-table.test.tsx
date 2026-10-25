// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import type { DashboardLearner } from '../types'
import { DashboardLearnerTable } from './dashboard-learner-table'

afterEach(cleanup)

describe('DashboardLearnerTable', () => {
  it('renders learner, group, goal progress, status, and details action as a table row', () => {
    const now = new Date('2026-10-08T00:00:00.000Z')
    const learner = {
      id: 'learner-1',
      name: 'Fahmi',
      avatar: null,
      dateOfBirth: null,
      createdAt: now,
      updatedAt: now,
      groupId: null,
      role: 'teacher',
      groupName: 'Family',
      goals: [
        {
          id: 'goal-1',
          learnerId: 'learner-1',
          groupId: null,
          title: 'Read Atomic Habits',
          description: null,
          currentValue: 5,
          targetValue: 10,
          unit: 'pages',
          startDate: new Date('2026-10-01T00:00:00.000Z'),
          endDate: new Date('2026-10-31T00:00:00.000Z'),
          createdAt: now,
          updatedAt: now,
          entries: [],
        },
      ],
    } satisfies DashboardLearner

    render(
      <MemoryRouter>
        <DashboardLearnerTable learners={[learner]} today="2026-10-08" />
      </MemoryRouter>,
    )

    const row = screen.getAllByRole('row')[1]
    expect(within(row).getByText('Fahmi')).toBeTruthy()
    expect(within(row).getByText('Family')).toBeTruthy()
    expect(within(row).getByText('0 of 1 goals completed')).toBeTruthy()
    expect(within(row).getByText('50%')).toBeTruthy()
    expect(within(row).getByText('Needs update')).toBeTruthy()
    expect(within(row).getByRole('link', { name: 'View Fahmi' }).getAttribute('href')).toBe(
      '/track-app/learners/learner-1',
    )
  })
})

// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SchedulePlanDialog } from './schedule-plan-dialog'

afterEach(cleanup)

describe('SchedulePlanDialog', () => {
  it('submits the selected learner even when the page URL has no learner parameter', async () => {
    const submitted = vi.fn()
    const now = new Date('2026-10-07T00:00:00.000Z')
    const router = createMemoryRouter(
      [
        {
          path: '/track-app/schedule',
          element: (
            <SchedulePlanDialog
              learnerId="learner-1"
              planItems={[
                {
                  id: 'item-1',
                  scheduleId: 'schedule-1',
                  sourceType: 'goal',
                  goalId: 'c03e4c93-3631-4a51-9597-6d3373081352',
                  trackId: null,
                  titleSnapshot: 'Read Atomic Habits',
                  plannedDurationMinutes: 60,
                  position: 0,
                  archivedAt: null,
                  createdAt: now,
                  updatedAt: now,
                },
              ]}
              sources={[
                {
                  id: 'c03e4c93-3631-4a51-9597-6d3373081352',
                  sourceType: 'goal',
                  title: 'Read Atomic Habits',
                  detail: '10% goal progress',
                },
              ]}
              startsOn="2026-10-07"
              timezone="Asia/Jakarta"
            />
          ),
          action: async ({ request }) => {
            submitted(Object.fromEntries(await request.formData()))
            return null
          },
        },
      ],
      { initialEntries: ['/track-app/schedule?view=today&date=2026-10-07'] },
    )

    render(<RouterProvider router={router} />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit repeating plan' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save repeating plan' }))

    await waitFor(() =>
      expect(submitted).toHaveBeenCalledWith(
        expect.objectContaining({
          intent: 'saveSchedulePlan',
          learnerId: 'learner-1',
          startsOn: '2026-10-07',
          timezone: 'Asia/Jakarta',
        }),
      ),
    )
  })
})

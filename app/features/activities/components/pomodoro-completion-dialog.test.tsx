// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PomodoroCompletionDialog } from './pomodoro-completion-dialog'

afterEach(cleanup)

describe('PomodoroCompletionDialog', () => {
  it('submits a prefilled Pomodoro activity through the existing activity action contract', async () => {
    const submitted = vi.fn()
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <PomodoroCompletionDialog
              setup={{ title: 'Practice arrays', durationMinutes: 25 }}
              durationMinutes={25}
              trackId="3d733783-98d5-4fc7-b31c-2120fdc58c42"
              topicName="JavaScript"
              today="2026-10-05"
              onDiscard={vi.fn()}
            />
          ),
          action: async ({ request }) => {
            submitted(Object.fromEntries(await request.formData()))
            return null
          },
        },
      ],
      { initialEntries: ['/'] },
    )

    render(<RouterProvider router={router} />)
    expect(screen.getByDisplayValue('Practice arrays')).toBeTruthy()
    expect(screen.getByText('Focused for 25 minutes')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('What did you learn? (optional)'), {
      target: { value: 'Map returns a new array.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save learning activity' }))

    await waitFor(() =>
      expect(submitted).toHaveBeenCalledWith({
        intent: 'createActivity',
        entryMode: 'pomodoro',
        trackId: '3d733783-98d5-4fc7-b31c-2120fdc58c42',
        activityDate: '2026-10-05',
        durationMinutes: '25',
        title: 'Practice arrays',
        note: 'Map returns a new array.',
      }),
    )
  })
})

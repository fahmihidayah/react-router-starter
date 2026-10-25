// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GoalPomodoroCompletionDialog } from './goal-pomodoro-completion-dialog'

afterEach(cleanup)

describe('GoalPomodoroCompletionDialog', () => {
  it('submits goal progress with the measured amount and focused duration', async () => {
    const submitted = vi.fn()
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <GoalPomodoroCompletionDialog
              setup={{ title: 'Read chapter four', durationMinutes: 25 }}
              durationMinutes={25}
              goalId="goal-1"
              learnerId="learner-1"
              goalTitle="Read 12 books"
              unit="pages"
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
    expect(screen.getByText('Read 12 books')).toBeTruthy()
    expect(screen.getByText('Focused for 25 minutes')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Amount (pages)'), { target: { value: '18' } })
    fireEvent.change(screen.getByLabelText('What did you learn? (optional)'), {
      target: { value: 'Summarized the main argument.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save progress entry' }))

    await waitFor(() =>
      expect(submitted).toHaveBeenCalledWith({
        intent: 'saveProgressEntry',
        entryMode: 'pomodoro',
        goalId: 'goal-1',
        learnerId: 'learner-1',
        durationMinutes: '25',
        value: '18',
        note: 'Summarized the main argument.',
      }),
    )
  })
})

// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, useActionData } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PomodoroSession } from './pomodoro-session'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-05T00:00:00.000Z'))
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('PomodoroSession', () => {
  it('keeps the focus screen open for review and closes it after a successful submission', async () => {
    let attempts = 0
    const action = vi.fn(async () => {
      attempts += 1
      return attempts === 1
        ? {
            success: false as const,
            errors: { title: ['Review the learning activity title.'] },
          }
        : null
    })

    function TestPage() {
      const actionData = useActionData() as
        | { errors?: Record<string, string[] | undefined> }
        | undefined

      return (
        <PomodoroSession
          trackId="track-1"
          topicName="JavaScript"
          today="2026-10-05"
          errors={actionData?.errors}
        />
      )
    }

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <TestPage />,
          action,
        },
      ],
      { initialEntries: ['/'] },
    )

    render(<RouterProvider router={router} />)
    fireEvent.click(screen.getByRole('button', { name: 'Start focus' }))

    const setupDialog = screen.getByRole('dialog')
    fireEvent.change(within(setupDialog).getByLabelText('What will you focus on?'), {
      target: { value: 'Practice arrays' },
    })
    fireEvent.change(within(setupDialog).getByLabelText('Custom'), {
      target: { value: '1' },
    })
    fireEvent.click(within(setupDialog).getByRole('button', { name: 'Begin focus session' }))

    act(() => vi.advanceTimersByTime(3_100))
    act(() => vi.advanceTimersByTime(1_000))
    fireEvent.click(screen.getByRole('button', { name: 'Finish early' }))
    fireEvent.click(screen.getByRole('button', { name: 'Review session' }))

    expect(screen.getByText('Focus mode')).toBeTruthy()
    expect(screen.getByDisplayValue('Practice arrays')).toBeTruthy()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save learning activity' }))
    })

    expect(action).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Review the learning activity title.')).toBeTruthy()
    expect(screen.getByText('Focus mode')).toBeTruthy()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save learning activity' }))
    })

    expect(action).toHaveBeenCalledTimes(2)
    expect(screen.queryByText('Focus mode')).toBeNull()
    expect(screen.getByRole('button', { name: 'Start focus' })).toBeTruthy()
  })
})

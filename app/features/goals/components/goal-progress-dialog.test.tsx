// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { GoalProgressDialog } from './goal-progress-dialog'

afterEach(cleanup)

describe('GoalProgressDialog', () => {
  it('offers focus mode as the primary flow while preserving manual progress entry', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <GoalProgressDialog
              goalId="goal-1"
              learnerId="learner-1"
              goalTitle="Read 12 books"
              unit="pages"
            />
          ),
        },
      ],
      { initialEntries: ['/'] },
    )

    render(<RouterProvider router={router} />)
    expect(screen.getByRole('button', { name: 'Start focus' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Add progress' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Start focus' }))
    const focusSetup = screen.getByRole('dialog')
    expect(within(focusSetup).getByDisplayValue('Read 12 books')).toBeTruthy()
    fireEvent.click(within(focusSetup).getByRole('button', { name: 'Cancel' }))

    fireEvent.click(screen.getByRole('button', { name: 'Add progress' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByLabelText('Amount (pages)')).toBeTruthy()
  })
})

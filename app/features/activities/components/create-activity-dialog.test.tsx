// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CreateActivityDialog } from './create-activity-dialog'

afterEach(cleanup)

describe('CreateActivityDialog', () => {
  it('keeps the title and current date visible while optional fields stay collapsed', async () => {
    const submitted = vi.fn()
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <CreateActivityDialog
              trackId="3d733783-98d5-4fc7-b31c-2120fdc58c42"
              topicName="Writing"
              today="2026-10-04"
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
    fireEvent.click(screen.getByRole('button', { name: 'Add learning log' }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByLabelText('What did you learn or do?')).toBeTruthy()
    expect(within(dialog).getByText('Date')).toBeTruthy()
    expect(within(dialog).getByText('Oct 4, 2026')).toBeTruthy()
    expect(
      within(dialog)
        .getByRole('button', { name: 'Optional details' })
        .getAttribute('aria-expanded'),
    ).toBe('false')

    fireEvent.change(within(dialog).getByLabelText('What did you learn or do?'), {
      target: { value: 'Practiced handwriting' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save activity' }))

    await waitFor(() =>
      expect(submitted).toHaveBeenCalledWith(
        expect.objectContaining({
          activityDate: '2026-10-04',
          title: 'Practiced handwriting',
          trackId: '3d733783-98d5-4fc7-b31c-2120fdc58c42',
        }),
      ),
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})

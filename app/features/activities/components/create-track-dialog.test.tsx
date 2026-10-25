// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CreateTrackDialog } from './create-track-dialog'

afterEach(cleanup)

describe('CreateTrackDialog', () => {
  it('dismisses after a successful save action', async () => {
    const submitted = vi.fn()
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <CreateTrackDialog />,
          action: async ({ request }) => {
            submitted(Object.fromEntries(await request.formData()))
            return null
          },
        },
      ],
      { initialEntries: ['/'] },
    )

    render(<RouterProvider router={router} />)
    fireEvent.click(screen.getByRole('button', { name: 'Add topic' }))
    fireEvent.change(screen.getByLabelText('Topic name'), { target: { value: 'Writing' } })
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Add topic' }))

    await waitFor(() =>
      expect(submitted).toHaveBeenCalledWith({ intent: 'createTrack', name: 'Writing' }),
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})

// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '~/components/ui/button'
import { DeleteLearnerDialog } from './delete-learner-dialog'

afterEach(cleanup)

function renderDialog() {
  const action = vi.fn()
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <DeleteLearnerDialog
            learner={{ id: 'learner-1', name: 'Alya' }}
            trigger={<Button>Delete learner</Button>}
          />
        ),
        action: async ({ request }) => {
          action(Object.fromEntries(await request.formData()))
          return null
        },
      },
    ],
    { initialEntries: ['/'] },
  )
  render(<RouterProvider router={router} />)
  return action
}

describe('DeleteLearnerDialog', () => {
  it('only enables deletion for the exact learner name, resets, and submits the form', async () => {
    const action = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Delete learner' }))
    let dialog = screen.getByRole('alertdialog')
    const confirmation = within(dialog).getByLabelText('Type Alya to confirm')
    const deleteButton = within(dialog).getByRole('button', { name: 'Delete learner' })

    expect(deleteButton.hasAttribute('disabled')).toBe(true)
    fireEvent.change(confirmation, { target: { value: 'alya' } })
    expect(deleteButton.hasAttribute('disabled')).toBe(true)
    fireEvent.change(confirmation, { target: { value: 'Alya' } })
    expect(deleteButton.hasAttribute('disabled')).toBe(false)

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('alertdialog')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Delete learner' }))
    dialog = screen.getByRole('alertdialog')
    expect((within(dialog).getByLabelText('Type Alya to confirm') as HTMLInputElement).value).toBe(
      '',
    )
    expect(
      within(dialog).getByRole('button', { name: 'Delete learner' }).hasAttribute('disabled'),
    ).toBe(true)

    fireEvent.change(within(dialog).getByLabelText('Type Alya to confirm'), {
      target: { value: 'Alya' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete learner' }))
    await waitFor(() =>
      expect(action).toHaveBeenCalledWith({ intent: 'delete', confirmation: 'Alya' }),
    )
  })
})

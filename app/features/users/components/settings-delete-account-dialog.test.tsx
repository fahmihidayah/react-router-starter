// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { ComponentType } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

// Mock all server-side modules to avoid importing node: modules in jsdom
vi.mock('~/features/observability/context.server', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    scope: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    })),
  },
}))
vi.mock('~/features/security/redis-rate-limit.server', () => ({
  consumeRedisRateLimit: vi.fn(),
  getRateLimitRedisClient: vi.fn(),
}))
vi.mock('~/features/security/rate-limit.server', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}))
vi.mock('~/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))
vi.mock('~/features/users/middlewares/auth.middleware', () => ({
  getSession: vi.fn(),
}))
vi.mock('~/lib/database', () => ({
  db: {},
}))

import TrackAppSettings from '~/routes/account/settings'

afterEach(cleanup)

function renderSettings() {
  const action = vi.fn()
  const user = {
    id: 'user-1',
    name: 'Test User',
    email: 'person@example.com',
    role: null,
  }
  const SettingsForTest = TrackAppSettings as unknown as ComponentType<{
    loaderData: { user: typeof user }
  }>
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <SettingsForTest loaderData={{ user }} />,
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

describe('settings delete account dialog', () => {
  it('matches email without case sensitivity, resets, and submits the form', async () => {
    const action = renderSettings()

    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }))
    let dialog = screen.getByRole('alertdialog')
    const confirmation = within(dialog).getByLabelText('Email address')
    const deleteButton = within(dialog).getByRole('button', { name: 'Delete account' })

    expect(deleteButton.hasAttribute('disabled')).toBe(true)
    fireEvent.change(confirmation, { target: { value: 'other@example.com' } })
    expect(deleteButton.hasAttribute('disabled')).toBe(true)
    fireEvent.change(confirmation, { target: { value: ' PERSON@EXAMPLE.COM ' } })
    expect(deleteButton.hasAttribute('disabled')).toBe(false)

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('alertdialog')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }))
    dialog = screen.getByRole('alertdialog')
    expect((within(dialog).getByLabelText('Email address') as HTMLInputElement).value).toBe('')
    expect(
      within(dialog).getByRole('button', { name: 'Delete account' }).hasAttribute('disabled'),
    ).toBe(true)

    fireEvent.change(within(dialog).getByLabelText('Email address'), {
      target: { value: 'person@example.com' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete account' }))
    await waitFor(() =>
      expect(action).toHaveBeenCalledWith({
        intent: 'deleteAccount',
        confirmation: 'person@example.com',
      }),
    )
  })
})

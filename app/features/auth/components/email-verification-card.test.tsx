// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { EmailVerificationCard } from './email-verification-card'

afterEach(cleanup)

function renderCard(props: React.ComponentProps<typeof EmailVerificationCard>) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <EmailVerificationCard {...props} />,
        action: () => null,
      },
    ],
    { initialEntries: ['/'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('EmailVerificationCard', () => {
  it('explains the verification steps and prefills the resend address', () => {
    renderCard({ state: 'pending', email: 'ayu@example.com' })

    expect(screen.getByText('Check your inbox')).toBeTruthy()
    expect(screen.getByText(/Open the activation email/)).toBeTruthy()
    expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('ayu@example.com')
    expect(screen.getByRole('button', { name: 'Send a new verification link' })).toBeTruthy()
  })

  it.each([
    ['expired', 'Verification link expired'],
    ['invalid', 'Verification link unavailable'],
  ] as const)('shows the %s recovery state', (state, title) => {
    renderCard({ state })

    expect(screen.getByText(title)).toBeTruthy()
    expect(screen.getByLabelText('Email')).toBeTruthy()
  })

  it('shows a verified continuation to the tracker', () => {
    renderCard({ state: 'success', continuePath: '/account' })

    const link = screen.getByRole('link', { name: /Continue to tracker/ })
    expect(link.getAttribute('href')).toBe('/account')
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('uses sign in as the safe fallback when no verified session is available', () => {
    renderCard({ state: 'success' })

    expect(screen.getByRole('link', { name: /Continue to sign in/ }).getAttribute('href')).toBe(
      '/login',
    )
  })

  it('announces resend success and validation errors accessibly', () => {
    renderCard({
      state: 'pending',
      response: { success: true, message: 'A new link was sent.' },
    })
    expect(screen.getByRole('status').textContent).toBe('A new link was sent.')

    cleanup()
    renderCard({
      state: 'pending',
      response: {
        success: false,
        message: 'Check the email address.',
        errors: { email: ['Enter a valid email address.'] },
      },
    })
    expect(screen.getAllByRole('alert').map((element) => element.textContent)).toEqual([
      'Enter a valid email address.',
      'Check the email address.',
    ])
    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBe('true')
  })

  it('disables the form and communicates progress while resending', () => {
    renderCard({ state: 'pending', isSubmitting: true })

    expect(screen.getByLabelText('Email').hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'Sending verification link...' })).toBeTruthy()
  })
})

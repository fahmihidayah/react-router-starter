// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MonthPicker } from './month-picker'

afterEach(cleanup)

describe('MonthPicker', () => {
  it('selects an available month and closes the picker', () => {
    const onValueChange = vi.fn()
    render(
      <MonthPicker
        value="2026-10"
        min="2026-08"
        max="2026-12"
        locale="en"
        label="Choose report month"
        onValueChange={onValueChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Choose report month' }))
    fireEvent.click(screen.getByRole('button', { name: 'November 2026' }))

    expect(onValueChange).toHaveBeenCalledWith('2026-11')
    expect(screen.queryByRole('group', { name: 'Choose report month' })).toBeNull()
  })

  it('disables months outside the configured range', () => {
    render(
      <MonthPicker
        value="2026-10"
        min="2026-08"
        max="2026-10"
        locale="en"
        label="Choose report month"
        onValueChange={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Choose report month' }))

    expect(screen.getByRole('button', { name: 'July 2026' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: 'October 2026' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(screen.getByRole('button', { name: 'November 2026' }).hasAttribute('disabled')).toBe(
      true,
    )
  })
})

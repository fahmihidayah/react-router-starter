// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DatePicker } from './date-picker'

afterEach(cleanup)

describe('DatePicker calendar navigation', () => {
  it('keeps six calendar rows and jumps to the selected month and year', () => {
    const { container } = render(
      <DatePicker
        id="birth-date"
        name="birthDate"
        placeholder="Choose a date"
        defaultMonth={new Date(2016, 9, 8)}
        startMonth={new Date(1926, 0, 1)}
        endMonth={new Date(2026, 11, 31)}
        captionLayout="dropdown"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Choose a date' }))

    expect(container.ownerDocument.querySelectorAll('.rdp-week')).toHaveLength(6)

    const [monthPicker, yearPicker] = screen.getAllByRole('combobox')
    fireEvent.change(monthPicker, { target: { value: '2' } })
    fireEvent.change(yearPicker, { target: { value: '2010' } })

    expect((monthPicker as HTMLSelectElement).value).toBe('2')
    expect((yearPicker as HTMLSelectElement).value).toBe('2010')
    expect((container.querySelector('input[name="birthDate"]') as HTMLInputElement).value).toBe('')
    expect(container.ownerDocument.querySelectorAll('.rdp-week')).toHaveLength(6)
  })
})

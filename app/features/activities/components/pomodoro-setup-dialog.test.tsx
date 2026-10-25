// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PomodoroSetupDialog } from './pomodoro-setup-dialog'

afterEach(cleanup)

describe('PomodoroSetupDialog', () => {
  it('requires an intention and starts with the selected duration', () => {
    const onStart = vi.fn()
    render(<PomodoroSetupDialog topicName="Writing" onStart={onStart} />)

    fireEvent.click(screen.getByRole('button', { name: 'Start focus' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText(/Writing/)).toBeTruthy()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Begin focus session' }))
    expect(within(dialog).getByText(/Enter what you want to learn/)).toBeTruthy()
    expect(onStart).not.toHaveBeenCalled()

    fireEvent.change(within(dialog).getByLabelText('What will you focus on?'), {
      target: { value: '  Practice essay structure  ' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: '45 min' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Begin focus session' }))

    expect(onStart).toHaveBeenCalledWith({
      title: 'Practice essay structure',
      durationMinutes: 45,
    })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('rejects custom durations outside the supported range', () => {
    const onStart = vi.fn()
    render(<PomodoroSetupDialog topicName="Writing" onStart={onStart} />)

    fireEvent.click(screen.getByRole('button', { name: 'Start focus' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText('What will you focus on?'), {
      target: { value: 'Practice' },
    })
    fireEvent.change(within(dialog).getByLabelText('Custom'), { target: { value: '121' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Begin focus session' }))

    expect(within(dialog).getByText(/between 1 and 120 minutes/)).toBeTruthy()
    expect(onStart).not.toHaveBeenCalled()
  })
})

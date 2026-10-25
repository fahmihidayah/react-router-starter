// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PomodoroFocusScreen } from './pomodoro-focus-screen'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-05T00:00:00.000Z'))
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function renderScreen(overrides?: {
  onAlarmStart?: () => void
  onAlarmStop?: () => void
  onReview?: (seconds: number) => void
}) {
  const props = {
    durationMinutes: 1,
    title: 'Practice arrays',
    topicName: 'JavaScript',
    onAlarmStart: overrides?.onAlarmStart ?? vi.fn(),
    onAlarmStop: overrides?.onAlarmStop ?? vi.fn(),
    onCancel: vi.fn(),
    onReview: overrides?.onReview ?? vi.fn(),
  }
  render(<PomodoroFocusScreen {...props} />)
  return props
}

describe('PomodoroFocusScreen', () => {
  it('runs the preparation countdown, timer, alarm, and review transition', () => {
    const onAlarmStart = vi.fn()
    const onAlarmStop = vi.fn()
    const onReview = vi.fn()
    renderScreen({ onAlarmStart, onAlarmStop, onReview })

    expect(screen.getByText('Get ready')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()

    act(() => vi.advanceTimersByTime(3_100))
    expect(screen.getByRole('timer').getAttribute('aria-label')).toContain('01:00')

    act(() => vi.advanceTimersByTime(60_100))
    expect(screen.getByText('Focus session complete')).toBeTruthy()
    expect(onAlarmStart).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Stop alarm' }))
    expect(onAlarmStop).toHaveBeenCalledTimes(1)
    expect(onReview).toHaveBeenCalledWith(60)
  })

  it('does not consume focus time while paused and can finish early', () => {
    const onReview = vi.fn()
    renderScreen({ onReview })

    act(() => vi.advanceTimersByTime(3_100))
    act(() => vi.advanceTimersByTime(10_000))
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    const pausedLabel = screen.getByRole('timer').getAttribute('aria-label')

    act(() => vi.advanceTimersByTime(30_000))
    expect(screen.getByRole('timer').getAttribute('aria-label')).toBe(pausedLabel)

    fireEvent.click(screen.getByRole('button', { name: 'Finish early' }))
    fireEvent.click(screen.getByRole('button', { name: 'Review session' }))
    expect(onReview).toHaveBeenCalledWith(10)
  })
})

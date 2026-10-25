import { describe, expect, it } from 'vitest'
import { formatPomodoroTime, pomodoroProgress } from './pomodoro-time'

describe('formatPomodoroTime', () => {
  it('formats remaining seconds as a stable timer value', () => {
    expect(formatPomodoroTime(0)).toBe('00:00')
    expect(formatPomodoroTime(65)).toBe('01:05')
    expect(formatPomodoroTime(1.2)).toBe('00:02')
    expect(formatPomodoroTime(-10)).toBe('00:00')
  })
})

describe('pomodoroProgress', () => {
  it('returns bounded progress for the timer ring', () => {
    expect(pomodoroProgress(60, 60)).toBe(0)
    expect(pomodoroProgress(30, 60)).toBe(0.5)
    expect(pomodoroProgress(0, 60)).toBe(1)
    expect(pomodoroProgress(-10, 60)).toBe(1)
    expect(pomodoroProgress(70, 60)).toBe(0)
    expect(pomodoroProgress(0, 0)).toBe(1)
  })
})

export function formatPomodoroTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function pomodoroProgress(remainingSeconds: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 1
  return Math.min(1, Math.max(0, 1 - remainingSeconds / durationSeconds))
}

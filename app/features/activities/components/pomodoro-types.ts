export type TPomodoroSetup = {
  title: string
  durationMinutes: number
}

export type TPomodoroPhase = 'preparing' | 'running' | 'paused' | 'completed'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { TPomodoroPhase } from './pomodoro-types'

const TICK_INTERVAL_MS = 100

export function usePomodoroTimer({
  durationSeconds,
  preparationSeconds = 3,
}: {
  durationSeconds: number
  preparationSeconds?: number
}) {
  const durationMilliseconds = durationSeconds * 1000
  const [phase, setPhase] = useState<TPomodoroPhase>('preparing')
  const [preparationRemaining, setPreparationRemaining] = useState(preparationSeconds)
  const [remainingMilliseconds, setRemainingMilliseconds] = useState(durationMilliseconds)
  const deadlineRef = useRef(Date.now() + preparationSeconds * 1000)

  useEffect(() => {
    const tick = () => {
      const untilDeadline = Math.max(0, deadlineRef.current - Date.now())

      if (phase === 'preparing') {
        setPreparationRemaining(Math.ceil(untilDeadline / 1000))
        if (untilDeadline === 0) {
          deadlineRef.current = Date.now() + durationMilliseconds
          setRemainingMilliseconds(durationMilliseconds)
          setPhase('running')
        }
      }

      if (phase === 'running') {
        setRemainingMilliseconds(untilDeadline)
        if (untilDeadline === 0) setPhase('completed')
      }
    }

    tick()
    if (phase !== 'preparing' && phase !== 'running') return
    const interval = setInterval(tick, TICK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [durationMilliseconds, phase])

  const pause = useCallback(() => {
    if (phase !== 'running') return
    setRemainingMilliseconds(Math.max(0, deadlineRef.current - Date.now()))
    setPhase('paused')
  }, [phase])

  const resume = useCallback(() => {
    if (phase !== 'paused') return
    deadlineRef.current = Date.now() + remainingMilliseconds
    setPhase('running')
  }, [phase, remainingMilliseconds])

  const remainingSeconds = Math.ceil(remainingMilliseconds / 1000)
  const elapsedSeconds = Math.max(
    0,
    Math.min(durationSeconds, Math.floor((durationMilliseconds - remainingMilliseconds) / 1000)),
  )

  return {
    elapsedSeconds,
    pause,
    phase,
    preparationRemaining,
    remainingSeconds,
    resume,
  }
}

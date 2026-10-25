import { useCallback, useEffect, useRef } from 'react'

type TAudioContextConstructor = typeof AudioContext

export type TPomodoroAlarm = {
  prepare: () => void
  start: () => void
  stop: () => void
}

export function usePomodoroAlarm(): TPomodoroAlarm {
  const contextRef = useRef<AudioContext | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getContext = useCallback(() => {
    if (typeof window === 'undefined') return null
    const AudioContextClass =
      (window as typeof window & { webkitAudioContext?: TAudioContextConstructor }).AudioContext ??
      (window as typeof window & { webkitAudioContext?: TAudioContextConstructor })
        .webkitAudioContext

    if (!AudioContextClass) return null
    contextRef.current ??= new AudioContextClass()
    return contextRef.current
  }, [])

  const prepare = useCallback(() => {
    const context = getContext()
    if (context?.state === 'suspended') void context.resume()
  }, [getContext])

  const playTone = useCallback(() => {
    const context = getContext()
    if (!context) return
    if (context.state === 'suspended') void context.resume()

    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, context.currentTime)
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.35, context.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.4)
  }, [getContext])

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  const start = useCallback(() => {
    stop()
    playTone()
    intervalRef.current = setInterval(playTone, 900)
  }, [playTone, stop])

  useEffect(() => {
    return () => {
      stop()
      if (contextRef.current && contextRef.current.state !== 'closed') {
        void contextRef.current.close()
      }
    }
  }, [stop])

  return { prepare, start, stop }
}

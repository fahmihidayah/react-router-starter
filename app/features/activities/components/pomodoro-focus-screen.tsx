import { Pause, Play, Square, X } from 'lucide-react'
import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import * as m from '~/paraglide/messages.js'
import { PomodoroTimerRing } from './pomodoro-timer-ring'
import { usePomodoroTimer } from './use-pomodoro-timer'

export function PomodoroFocusScreen({
  durationMinutes,
  title,
  topicName,
  onAlarmStart,
  onAlarmStop,
  onCancel,
  onReview,
  reviewContent,
}: {
  durationMinutes: number
  title: string
  topicName: string
  onAlarmStart: () => void
  onAlarmStop: () => void
  onCancel: () => void
  onReview: (elapsedSeconds: number) => void
  reviewContent?: ReactNode
}) {
  const durationSeconds = durationMinutes * 60
  const timer = usePomodoroTimer({ durationSeconds })
  const alarmStartedRef = useRef(false)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const preventAccidentalExit = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', preventAccidentalExit)
    return () => window.removeEventListener('beforeunload', preventAccidentalExit)
  }, [])

  useEffect(() => {
    if (timer.phase === 'completed' && !alarmStartedRef.current) {
      alarmStartedRef.current = true
      onAlarmStart()
    }
  }, [onAlarmStart, timer.phase])

  function stopAlarmAndReview() {
    onAlarmStop()
    onReview(durationSeconds)
  }

  function finishEarly() {
    onAlarmStop()
    timer.pause()
    onReview(Math.max(1, timer.elapsedSeconds))
  }

  const screen = (
    <div className="fixed inset-0 z-40 flex min-h-dvh flex-col overflow-y-auto bg-background">
      <header className="flex items-center justify-between gap-4 p-4 sm:p-6">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">{m.pomodoro_focus_mode()}</p>
          <p className="truncate text-sm text-muted-foreground">{topicName}</p>
        </div>
        {!reviewContent && timer.phase !== 'completed' ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" size="icon" variant="ghost" aria-label={m.pomodoro_exit()}>
                <X />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{m.pomodoro_exit_title()}</AlertDialogTitle>
                <AlertDialogDescription>{m.pomodoro_exit_description()}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{m.pomodoro_keep_focusing()}</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button type="button" variant="destructive" onClick={onCancel}>
                    {m.pomodoro_discard_session()}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8 text-center">
        {reviewContent ? (
          reviewContent
        ) : timer.phase === 'preparing' ? (
          <div className="space-y-5" aria-live="assertive">
            <div className="mx-auto grid size-44 place-items-center rounded-full border-8 border-muted bg-card shadow-sm">
              <span className="text-7xl font-semibold tabular-nums">
                {timer.preparationRemaining}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{m.pomodoro_get_ready()}</h1>
              <p className="mt-2 text-muted-foreground">{m.pomodoro_get_ready_description()}</p>
            </div>
          </div>
        ) : timer.phase === 'completed' ? (
          <div className="max-w-lg space-y-7" aria-live="assertive">
            <div className="mx-auto grid size-52 place-items-center rounded-full border-8 border-primary bg-primary/10">
              <ClockCompleteIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">{m.pomodoro_time_up()}</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                {m.pomodoro_session_complete()}
              </h1>
              <p className="mt-3 text-muted-foreground">{m.pomodoro_alarm_description()}</p>
            </div>
            <Button type="button" size="lg" className="min-w-48" onClick={stopAlarmAndReview}>
              <Square /> {m.pomodoro_stop_alarm()}
            </Button>
          </div>
        ) : (
          <>
            <PomodoroTimerRing
              durationSeconds={durationSeconds}
              remainingSeconds={timer.remainingSeconds}
              label={
                timer.phase === 'paused' ? m.pomodoro_paused() : m.pomodoro_session_in_progress()
              }
            />
            <div className="max-w-xl">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
              <p className="mt-2 text-muted-foreground">{m.pomodoro_stay_focused()}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {timer.phase === 'paused' ? (
                <Button type="button" size="lg" onClick={timer.resume}>
                  <Play /> {m.pomodoro_resume()}
                </Button>
              ) : (
                <Button type="button" size="lg" variant="outline" onClick={timer.pause}>
                  <Pause /> {m.pomodoro_pause()}
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" size="lg" variant="ghost">
                    <Square /> {m.pomodoro_finish_early()}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{m.pomodoro_finish_early_title()}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {m.pomodoro_finish_early_description()}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{m.pomodoro_keep_focusing()}</AlertDialogCancel>
                    <AlertDialogAction onClick={finishEarly}>
                      {m.pomodoro_review_session()}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
      </main>

      <footer className="p-4 text-center text-xs text-muted-foreground sm:p-6">
        {m.pomodoro_focus_footer()}
      </footer>
    </div>
  )

  return createPortal(screen, document.body)
}

function ClockCompleteIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className="size-28 text-primary">
      <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeWidth="4" />
      <path
        d="M32 18v15l10 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

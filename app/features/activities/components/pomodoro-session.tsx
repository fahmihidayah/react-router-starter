import { useCallback, useState } from 'react'
import { PomodoroCompletionDialog } from './pomodoro-completion-dialog'
import { PomodoroFocusScreen } from './pomodoro-focus-screen'
import { PomodoroSetupDialog } from './pomodoro-setup-dialog'
import type { TPomodoroSetup } from './pomodoro-types'
import { usePomodoroAlarm } from './use-pomodoro-alarm'
import { usePomodoroSubmission } from './use-pomodoro-submission'

type TPomodoroReview = {
  setup: TPomodoroSetup
  durationMinutes: number
}

export function PomodoroSession({
  trackId,
  topicName,
  today,
  errors,
}: {
  trackId: string
  topicName: string
  today: string
  errors?: Record<string, string[] | undefined>
}) {
  const [activeSetup, setActiveSetup] = useState<TPomodoroSetup | null>(null)
  const [review, setReview] = useState<TPomodoroReview | null>(null)
  const alarm = usePomodoroAlarm()

  const closeSession = useCallback(() => {
    alarm.stop()
    setReview(null)
    setActiveSetup(null)
  }, [alarm])

  const submission = usePomodoroSubmission({
    active: Boolean(review),
    intent: 'createActivity',
    errors,
    onSuccess: closeSession,
  })

  const startSession = useCallback(
    (setup: TPomodoroSetup) => {
      alarm.prepare()
      setReview(null)
      setActiveSetup(setup)
    },
    [alarm],
  )

  const cancelSession = useCallback(() => {
    closeSession()
  }, [closeSession])

  const reviewSession = useCallback(
    (elapsedSeconds: number) => {
      if (!activeSetup) return
      alarm.stop()
      setReview({
        setup: activeSetup,
        durationMinutes: Math.max(1, Math.ceil(elapsedSeconds / 60)),
      })
    },
    [activeSetup, alarm],
  )

  return (
    <>
      <PomodoroSetupDialog topicName={topicName} onStart={startSession} />
      {activeSetup ? (
        <PomodoroFocusScreen
          durationMinutes={activeSetup.durationMinutes}
          title={activeSetup.title}
          topicName={topicName}
          onAlarmStart={alarm.start}
          onAlarmStop={alarm.stop}
          onCancel={cancelSession}
          onReview={reviewSession}
          reviewContent={
            review ? (
              <PomodoroCompletionDialog
                setup={review.setup}
                durationMinutes={review.durationMinutes}
                trackId={trackId}
                topicName={topicName}
                today={today}
                errors={errors}
                isSubmitting={submission.isSubmitting}
                onDiscard={closeSession}
              />
            ) : undefined
          }
        />
      ) : null}
    </>
  )
}

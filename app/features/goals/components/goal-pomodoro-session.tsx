import { useCallback, useState } from 'react'
import {
  PomodoroFocusScreen,
  PomodoroSetupDialog,
  type TPomodoroSetup,
  usePomodoroAlarm,
  usePomodoroSubmission,
} from '~/features/activities/components'
import * as m from '~/paraglide/messages.js'
import { GoalPomodoroCompletionDialog } from './goal-pomodoro-completion-dialog'

type TGoalPomodoroReview = {
  setup: TPomodoroSetup
  durationMinutes: number
}

export function GoalPomodoroSession({
  goalId,
  learnerId,
  goalTitle,
  unit,
  errors,
  scheduleTodoId,
  activityDate,
}: {
  goalId: string
  learnerId?: string
  goalTitle: string
  unit: string
  errors?: Record<string, string[] | undefined>
  scheduleTodoId?: string
  activityDate?: string
}) {
  const [activeSetup, setActiveSetup] = useState<TPomodoroSetup | null>(null)
  const [review, setReview] = useState<TGoalPomodoroReview | null>(null)
  const alarm = usePomodoroAlarm()

  const closeSession = useCallback(() => {
    alarm.stop()
    setReview(null)
    setActiveSetup(null)
  }, [alarm])

  const submission = usePomodoroSubmission({
    active: Boolean(review),
    intent: 'saveProgressEntry',
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
      <PomodoroSetupDialog
        topicName={goalTitle}
        description={m.goal_pomodoro_setup_description({ goal: goalTitle })}
        initialTitle={goalTitle}
        onStart={startSession}
      />
      {activeSetup ? (
        <PomodoroFocusScreen
          durationMinutes={activeSetup.durationMinutes}
          title={activeSetup.title}
          topicName={goalTitle}
          onAlarmStart={alarm.start}
          onAlarmStop={alarm.stop}
          onCancel={cancelSession}
          onReview={reviewSession}
          reviewContent={
            review ? (
              <GoalPomodoroCompletionDialog
                setup={review.setup}
                durationMinutes={review.durationMinutes}
                goalId={goalId}
                learnerId={learnerId}
                goalTitle={goalTitle}
                unit={unit}
                errors={errors}
                isSubmitting={submission.isSubmitting}
                onDiscard={closeSession}
                scheduleTodoId={scheduleTodoId}
                activityDate={activityDate}
              />
            ) : undefined
          }
        />
      ) : null}
    </>
  )
}

import { Plus } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { useActionDialog } from '~/hooks/use-action-dialog'
import * as m from '~/paraglide/messages.js'
import { GoalPomodoroSession } from './goal-pomodoro-session'
import { GoalProgressForm } from './goal-progress-form'

export function GoalProgressDialog({
  goalId,
  learnerId,
  goalTitle,
  unit,
  errors,
  defaultOpen = false,
  entryMode,
  scheduleTodoId,
  defaultDurationMinutes,
  triggerLabel,
  activityDate,
}: {
  goalId: string
  learnerId?: string
  goalTitle: string
  unit: string
  errors?: Record<string, string[] | undefined>
  defaultOpen?: boolean
  entryMode?: 'manual' | 'pomodoro'
  scheduleTodoId?: string
  defaultDurationMinutes?: number
  triggerLabel?: string
  activityDate?: string
}) {
  const manualErrors = entryMode === 'pomodoro' ? undefined : errors
  const dialog = useActionDialog({
    intent: 'saveProgressEntry',
    errors: manualErrors,
    defaultOpen: defaultOpen && entryMode !== 'pomodoro',
  })

  return (
    <>
      <GoalPomodoroSession
        goalId={goalId}
        learnerId={learnerId}
        goalTitle={goalTitle}
        unit={unit}
        errors={entryMode === 'pomodoro' ? errors : undefined}
        scheduleTodoId={scheduleTodoId}
        activityDate={activityDate}
      />
      <Dialog open={dialog.open} onOpenChange={dialog.setOpen}>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="outline">
            <Plus /> {triggerLabel ?? m.goal_add_progress()}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.goal_record_today()}</DialogTitle>
            <DialogDescription>
              {m.goal_progress_form_description({ title: goalTitle })}
            </DialogDescription>
          </DialogHeader>
          <GoalProgressForm
            goalId={goalId}
            learnerId={learnerId}
            unit={unit}
            errors={manualErrors}
            scheduleTodoId={scheduleTodoId}
            defaultDurationMinutes={defaultDurationMinutes}
            activityDate={activityDate}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

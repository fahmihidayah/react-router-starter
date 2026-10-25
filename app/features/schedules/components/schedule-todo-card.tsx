import {
  ArrowDown,
  ArrowUp,
  BookOpenCheck,
  CheckCircle2,
  Circle,
  Clock3,
  Trash2,
} from 'lucide-react'
import { Form } from 'react-router'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { CreateActivityDialog } from '~/features/activities/components/create-activity-dialog'
import { GoalProgressDialog } from '~/features/goals/components/goal-progress-dialog'
import { cn } from '~/lib/utils'
import * as m from '~/paraglide/messages.js'
import type { ScheduleTodoWithProgress } from '../types'

export type ScheduleGoalReference = {
  currentValue: number
  id: string
  targetValue: number
  title: string
  unit: string
}

export type ScheduleTrackReference = {
  id: string
  name: string
}

function TodoStatus({ todo, isPast }: { todo: ScheduleTodoWithProgress; isPast: boolean }) {
  if (todo.completed) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="size-3.5" /> {m.schedule_completed()}
      </span>
    )
  }
  if (isPast) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
        <Clock3 className="size-3.5" /> {m.schedule_missed()}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Circle className="size-3.5" /> {m.schedule_planned()}
    </span>
  )
}

function TodoCompletionAction({
  todo,
  learnerId,
  date,
  goal,
  track,
  goalErrors,
  activityErrors,
}: {
  todo: ScheduleTodoWithProgress
  learnerId: string
  date: string
  goal?: ScheduleGoalReference
  track?: ScheduleTrackReference
  goalErrors?: Record<string, string[] | undefined>
  activityErrors?: Record<string, string[] | undefined>
}) {
  if (todo.sourceType === 'goal' && goal) {
    return (
      <GoalProgressDialog
        goalId={goal.id}
        learnerId={learnerId}
        goalTitle={goal.title}
        unit={goal.unit}
        errors={goalErrors}
        defaultOpen={Boolean(goalErrors)}
        scheduleTodoId={todo.id}
        defaultDurationMinutes={todo.plannedDurationMinutes}
        triggerLabel={m.schedule_complete_todo()}
        activityDate={date}
      />
    )
  }
  if (todo.sourceType === 'activity_track' && track) {
    return (
      <CreateActivityDialog
        trackId={track.id}
        topicName={track.name}
        today={date}
        errors={activityErrors}
        defaultOpen={Boolean(activityErrors)}
        learnerId={learnerId}
        scheduleTodoId={todo.id}
        defaultDurationMinutes={todo.plannedDurationMinutes}
        defaultTitle={todo.titleSnapshot}
        triggerLabel={m.schedule_complete_todo()}
      />
    )
  }
  return null
}

function RemoveTodoDialog({
  todo,
  learnerId,
  date,
}: {
  todo: ScheduleTodoWithProgress
  learnerId: string
  date: string
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={m.schedule_remove({ title: todo.titleSnapshot })}
        >
          <Trash2 className="text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <Form method="post">
          <input type="hidden" name="intent" value="removeScheduleTodo" />
          <input type="hidden" name="learnerId" value={learnerId} />
          <input type="hidden" name="todoId" value={todo.id} />
          <input type="hidden" name="date" value={date} />
          <AlertDialogHeader>
            <AlertDialogTitle>{m.schedule_remove_title()}</AlertDialogTitle>
            <AlertDialogDescription>{m.schedule_remove_description()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>{m.schedule_cancel()}</AlertDialogCancel>
            <Button type="submit" variant="destructive">
              {m.schedule_remove_action()}
            </Button>
          </AlertDialogFooter>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function MoveTodoButton({
  todo,
  learnerId,
  date,
  direction,
  disabled,
}: {
  todo: ScheduleTodoWithProgress
  learnerId: string
  date: string
  direction: 'down' | 'up'
  disabled: boolean
}) {
  const label =
    direction === 'up'
      ? m.schedule_move_up({ title: todo.titleSnapshot })
      : m.schedule_move_down({ title: todo.titleSnapshot })
  return (
    <Form method="post">
      <input type="hidden" name="intent" value="moveScheduleTodo" />
      <input type="hidden" name="learnerId" value={learnerId} />
      <input type="hidden" name="todoId" value={todo.id} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="direction" value={direction} />
      <Button type="submit" variant="ghost" size="icon-sm" aria-label={label} disabled={disabled}>
        {direction === 'up' ? <ArrowUp /> : <ArrowDown />}
      </Button>
    </Form>
  )
}

export function ScheduleTodoCard({
  todo,
  index,
  count,
  learnerId,
  selectedDate,
  today,
  canManage,
  goal,
  track,
  goalErrors,
  activityErrors,
}: {
  todo: ScheduleTodoWithProgress
  index: number
  count: number
  learnerId: string
  selectedDate: string
  today: string
  canManage: boolean
  goal?: ScheduleGoalReference
  track?: ScheduleTrackReference
  goalErrors?: Record<string, string[] | undefined>
  activityErrors?: Record<string, string[] | undefined>
}) {
  const isPast = selectedDate < today
  const canEdit = canManage && !isPast && !todo.completed
  const canComplete = canManage && selectedDate === today && !todo.completed
  const goalPercent = goal
    ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
    : undefined

  return (
    <article
      className={cn(
        'rounded-xl border bg-card p-4 shadow-sm transition-colors',
        todo.completed &&
          'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/10',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {todo.completed ? <CheckCircle2 className="size-5" /> : index + 1}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className={cn('font-semibold', todo.completed && 'line-through opacity-70')}>
                {todo.titleSnapshot}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="size-3.5" />
                  {m.schedule_minutes_count({ count: todo.plannedDurationMinutes })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <BookOpenCheck className="size-3.5" />
                  {todo.sourceType === 'goal' ? m.schedule_goal() : m.schedule_activity()}
                </span>
                {goalPercent !== undefined ? (
                  <span>{m.schedule_goal_progress({ percent: goalPercent })}</span>
                ) : null}
                {todo.completed ? (
                  <span>{m.schedule_actual_minutes({ count: todo.actualDurationMinutes })}</span>
                ) : null}
              </div>
            </div>
            <TodoStatus todo={todo} isPast={isPast} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div>
              {canComplete ? (
                <TodoCompletionAction
                  todo={todo}
                  learnerId={learnerId}
                  date={selectedDate}
                  goal={goal}
                  track={track}
                  goalErrors={goalErrors}
                  activityErrors={activityErrors}
                />
              ) : null}
            </div>
            {canEdit ? (
              <div className="flex items-center">
                <MoveTodoButton
                  todo={todo}
                  learnerId={learnerId}
                  date={selectedDate}
                  direction="up"
                  disabled={index === 0}
                />
                <MoveTodoButton
                  todo={todo}
                  learnerId={learnerId}
                  date={selectedDate}
                  direction="down"
                  disabled={index === count - 1}
                />
                <RemoveTodoDialog todo={todo} learnerId={learnerId} date={selectedDate} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}

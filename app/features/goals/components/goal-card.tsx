import { CalendarDays, CheckCircle2, ExternalLink, GripVertical, Trash2 } from 'lucide-react'
import type { RefCallback } from 'react'
import { Form, Link } from 'react-router'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import type { GoalWithProgress } from '../types'
import { GoalProgressDialog } from './goal-progress-dialog'

interface GoalCardProps {
  goal: GoalWithProgress
  errors?: Record<string, string[] | undefined>
  defaultOpen?: boolean
  entryMode?: 'manual' | 'pomodoro'
  dragHandleRef?: RefCallback<Element>
  isDragging?: boolean
  canManage?: boolean
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(getLocale(), { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}

export function GoalCard({
  goal,
  errors,
  defaultOpen = false,
  entryMode,
  dragHandleRef,
  isDragging = false,
  canManage = true,
}: GoalCardProps) {
  const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
  const complete = goal.currentValue >= goal.targetValue

  return (
    <Card className={`h-full gap-4 py-4 transition-opacity ${isDragging ? 'opacity-40' : ''}`}>
      <CardHeader className="grid-cols-[1fr_auto] px-4">
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            {complete ? <CheckCircle2 className="size-5 shrink-0 text-emerald-600" /> : null}
            <span className="truncate">{goal.title}</span>
          </CardTitle>
          {goal.description ? (
            <CardDescription className="line-clamp-2">{goal.description}</CardDescription>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {dragHandleRef ? (
            <Button
              ref={dragHandleRef}
              type="button"
              variant="ghost"
              size="icon-sm"
              className="cursor-grab touch-none active:cursor-grabbing"
              aria-label={m.goal_group_drag_named({ title: goal.title })}
            >
              <GripVertical />
            </Button>
          ) : null}
          {canManage ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={m.goal_delete_label({ title: goal.title })}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{m.goal_delete_named({ title: goal.title })}</AlertDialogTitle>
                  <AlertDialogDescription>{m.goal_delete_description()}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{m.learner_cancel()}</AlertDialogCancel>
                  <Form method="post">
                    <input type="hidden" name="intent" value="deleteGoal" />
                    <input type="hidden" name="goalId" value={goal.id} />
                    <AlertDialogAction asChild>
                      <Button type="submit" variant="destructive">
                        {m.goal_delete_action()}
                      </Button>
                    </AlertDialogAction>
                  </Form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 px-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              {m.goal_current_of_target({
                current: goal.currentValue,
                target: goal.targetValue,
                unit: goal.unit,
              })}
            </span>
            <span className="font-medium">{percent}%</span>
          </div>
          <Progress
            value={percent}
            aria-label={m.goal_progress_label({ title: goal.title, percent })}
          />
        </div>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          {formatDate(goal.startDate)} – {formatDate(goal.endDate)}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {canManage ? (
            <GoalProgressDialog
              goalId={goal.id}
              goalTitle={goal.title}
              unit={goal.unit}
              errors={errors}
              defaultOpen={defaultOpen}
              entryMode={entryMode}
            />
          ) : null}
          <Button asChild type="button" size="sm" variant="outline">
            <Link to={`/track-app/goals/${goal.id}`}>
              <ExternalLink /> {m.goal_view_details()}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

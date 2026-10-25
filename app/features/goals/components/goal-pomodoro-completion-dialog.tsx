import { CheckCircle2, Clock3, Target } from 'lucide-react'
import { Form } from 'react-router'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import type { TPomodoroSetup } from '~/features/activities/components'
import * as m from '~/paraglide/messages.js'

function ErrorText({ value }: { value?: string }) {
  return value ? <p className="text-sm text-destructive">{value}</p> : null
}

export function GoalPomodoroCompletionDialog({
  setup,
  durationMinutes,
  goalId,
  learnerId,
  goalTitle,
  unit,
  errors,
  isSubmitting,
  onDiscard,
  scheduleTodoId,
  activityDate,
}: {
  setup: TPomodoroSetup
  durationMinutes: number
  goalId: string
  learnerId?: string
  goalTitle: string
  unit: string
  errors?: Record<string, string[] | undefined>
  isSubmitting?: boolean
  onDiscard: () => void
  scheduleTodoId?: string
  activityDate?: string
}) {
  return (
    <Form method="post" className="w-full max-w-xl text-left">
      <Card aria-labelledby={`goal-pomodoro-review-title-${goalId}`}>
        <CardHeader>
          <div className="mb-1 flex items-center gap-2 text-primary">
            <CheckCircle2 className="size-5" />
            <span className="text-sm font-medium">{m.pomodoro_completed_badge()}</span>
          </div>
          <CardTitle id={`goal-pomodoro-review-title-${goalId}`}>
            {m.goal_pomodoro_review_title()}
          </CardTitle>
          <CardDescription>{m.goal_pomodoro_review_description()}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <input type="hidden" name="intent" value="saveProgressEntry" />
          <input type="hidden" name="entryMode" value="pomodoro" />
          <input type="hidden" name="goalId" value={goalId} />
          {scheduleTodoId ? (
            <input type="hidden" name="scheduleTodoId" value={scheduleTodoId} />
          ) : null}
          {activityDate ? <input type="hidden" name="activityDate" value={activityDate} /> : null}
          {learnerId ? <input type="hidden" name="learnerId" value={learnerId} /> : null}
          <input type="hidden" name="durationMinutes" value={durationMinutes} />

          <div className="space-y-3 rounded-lg bg-muted p-4">
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{m.goal_title()}</p>
                <p className="font-medium">{goalTitle}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {m.pomodoro_focused_for({ count: durationMinutes })}
                </p>
                <p className="text-xs text-muted-foreground">{setup.title}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`goal-pomodoro-value-${goalId}`}>
              {m.goal_amount_with_unit({ unit })}
            </Label>
            <div className="flex">
              <Input
                id={`goal-pomodoro-value-${goalId}`}
                name="value"
                type="number"
                min="1"
                max="1000000"
                required
                autoFocus
                className="rounded-r-none"
              />
              <span className="flex items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
                {unit}
              </span>
            </div>
            <ErrorText value={errors?.value?.[0]} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`goal-pomodoro-note-${goalId}`}>{m.pomodoro_reflection()}</Label>
            <Textarea
              id={`goal-pomodoro-note-${goalId}`}
              name="note"
              placeholder={m.goal_pomodoro_reflection_placeholder()}
              maxLength={500}
              rows={4}
            />
            <ErrorText value={errors?.note?.[0]} />
          </div>

          <ErrorText value={errors?.durationMinutes?.[0]} />
          <ErrorText value={errors?.form?.[0]} />
        </CardContent>

        <CardFooter className="justify-end gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="ghost" disabled={isSubmitting}>
                {m.goal_pomodoro_discard_progress()}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{m.goal_pomodoro_discard_title()}</AlertDialogTitle>
                <AlertDialogDescription>
                  {m.goal_pomodoro_discard_description()}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{m.pomodoro_keep_log()}</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button type="button" variant="destructive" onClick={onDiscard}>
                    {m.goal_pomodoro_discard_progress()}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? m.pomodoro_saving() : m.goal_save_progress_entry()}
          </Button>
        </CardFooter>
      </Card>
    </Form>
  )
}

import { CheckCircle2, Clock3 } from 'lucide-react'
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
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import type { TPomodoroSetup } from './pomodoro-types'

function ErrorText({ value }: { value?: string }) {
  return value ? <p className="text-sm text-destructive">{value}</p> : null
}

export function PomodoroCompletionDialog({
  setup,
  durationMinutes,
  trackId,
  topicName,
  today,
  errors,
  isSubmitting,
  onDiscard,
}: {
  setup: TPomodoroSetup
  durationMinutes: number
  trackId: string
  topicName: string
  today: string
  errors?: Record<string, string[] | undefined>
  isSubmitting?: boolean
  onDiscard: () => void
}) {
  const formattedToday = new Intl.DateTimeFormat(getLocale(), {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(`${today}T00:00:00Z`))

  return (
    <Form method="post" className="w-full max-w-xl text-left">
      <Card aria-labelledby={`pomodoro-review-title-${trackId}`}>
        <CardHeader>
          <div className="mb-1 flex items-center gap-2 text-primary">
            <CheckCircle2 className="size-5" />
            <span className="text-sm font-medium">{m.pomodoro_completed_badge()}</span>
          </div>
          <CardTitle id={`pomodoro-review-title-${trackId}`}>{m.pomodoro_review_title()}</CardTitle>
          <CardDescription>{m.pomodoro_review_description()}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <input type="hidden" name="intent" value="createActivity" />
          <input type="hidden" name="entryMode" value="pomodoro" />
          <input type="hidden" name="trackId" value={trackId} />
          <input type="hidden" name="activityDate" value={today} />
          <input type="hidden" name="durationMinutes" value={durationMinutes} />

          <div className="grid gap-3 rounded-lg bg-muted p-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-muted-foreground">{m.activity_track()}</p>
              <p className="mt-1 font-medium">{topicName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{m.activity_date()}</p>
              <p className="mt-1 font-medium">{formattedToday}</p>
            </div>
            <div className="flex items-center gap-2 sm:col-span-3">
              <Clock3 className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {m.pomodoro_focused_for({ count: durationMinutes })}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`pomodoro-title-${trackId}`}>{m.activity_title()}</Label>
            <Input
              id={`pomodoro-title-${trackId}`}
              name="title"
              defaultValue={setup.title}
              maxLength={160}
              required
            />
            <ErrorText value={errors?.title?.[0]} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`pomodoro-note-${trackId}`}>{m.pomodoro_reflection()}</Label>
            <Textarea
              id={`pomodoro-note-${trackId}`}
              name="note"
              placeholder={m.pomodoro_reflection_placeholder()}
              maxLength={1000}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">{m.pomodoro_reflection_hint()}</p>
            <ErrorText value={errors?.note?.[0]} />
          </div>

          <ErrorText value={errors?.trackId?.[0]} />
          <ErrorText value={errors?.activityDate?.[0]} />
          <ErrorText value={errors?.durationMinutes?.[0]} />
        </CardContent>

        <CardFooter className="justify-end gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="ghost" disabled={isSubmitting}>
                {m.pomodoro_discard_log()}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{m.pomodoro_discard_log_title()}</AlertDialogTitle>
                <AlertDialogDescription>
                  {m.pomodoro_discard_log_description()}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{m.pomodoro_keep_log()}</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button type="button" variant="destructive" onClick={onDiscard}>
                    {m.pomodoro_discard_log()}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? m.pomodoro_saving() : m.pomodoro_save_activity()}
          </Button>
        </CardFooter>
      </Card>
    </Form>
  )
}

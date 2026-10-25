import { Clock3, Play } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { cn } from '~/lib/utils'
import * as m from '~/paraglide/messages.js'
import type { TPomodoroSetup } from './pomodoro-types'

const DURATION_PRESETS = [15, 25, 45, 60]

export function PomodoroSetupDialog({
  topicName,
  description,
  initialTitle = '',
  onStart,
  triggerClassName,
}: {
  topicName: string
  description?: string
  initialTitle?: string
  onStart: (setup: TPomodoroSetup) => void
  triggerClassName?: string
}) {
  const titleId = useId()
  const durationId = useId()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [duration, setDuration] = useState(25)
  const [attempted, setAttempted] = useState(false)
  const titleValid = title.trim().length > 0 && title.trim().length <= 160
  const durationValid = Number.isInteger(duration) && duration >= 1 && duration <= 120

  function startSession() {
    setAttempted(true)
    if (!titleValid || !durationValid) return
    onStart({ title: title.trim(), durationMinutes: duration })
    setOpen(false)
    setAttempted(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" className={triggerClassName}>
          <Clock3 /> {m.pomodoro_start_focus()}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{m.pomodoro_setup_title()}</DialogTitle>
          <DialogDescription>
            {description ?? m.pomodoro_setup_description({ topic: topicName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor={titleId}>{m.pomodoro_learning_intention()}</Label>
            <Input
              id={titleId}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={m.pomodoro_learning_intention_placeholder()}
              maxLength={160}
              autoFocus
              aria-invalid={attempted && !titleValid}
              onKeyDown={(event) => {
                if (event.key === 'Enter') startSession()
              }}
            />
            {attempted && !titleValid ? (
              <p className="text-sm text-destructive">{m.pomodoro_error_intention()}</p>
            ) : null}
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">{m.pomodoro_session_length()}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DURATION_PRESETS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setDuration(minutes)}
                  aria-pressed={duration === minutes}
                  className={cn(
                    'rounded-lg border px-3 py-3 text-sm font-medium transition-colors',
                    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
                    duration === minutes
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background hover:bg-muted',
                  )}
                >
                  {m.pomodoro_minutes_option({ count: minutes })}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor={durationId} className="shrink-0">
                {m.pomodoro_custom_length()}
              </Label>
              <Input
                id={durationId}
                className="max-w-28"
                type="number"
                min="1"
                max="120"
                value={duration}
                onChange={(event) => setDuration(event.currentTarget.valueAsNumber)}
                aria-invalid={attempted && !durationValid}
              />
              <span className="text-sm text-muted-foreground">{m.pomodoro_minutes()}</span>
            </div>
            {attempted && !durationValid ? (
              <p className="text-sm text-destructive">{m.pomodoro_error_duration()}</p>
            ) : null}
          </fieldset>

          <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            {m.pomodoro_prepare_hint()}
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {m.learner_cancel()}
          </Button>
          <Button type="button" onClick={startSession}>
            <Play /> {m.pomodoro_begin()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

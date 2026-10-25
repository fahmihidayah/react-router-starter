import { Plus } from 'lucide-react'
import { Form } from 'react-router'
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
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import { useActionDialog } from '~/hooks/use-action-dialog'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import type { ScheduleSourceOption } from '../types'

function displayDate(date: string): string {
  return new Intl.DateTimeFormat(getLocale(), { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00.000Z`),
  )
}

export function AddScheduleTodoDialog({
  learnerId,
  learnerName,
  scheduledDate,
  sources,
  errors,
  disabled = false,
}: {
  learnerId: string
  learnerName: string
  scheduledDate: string
  sources: ScheduleSourceOption[]
  errors?: Record<string, string[] | undefined>
  disabled?: boolean
}) {
  const dialog = useActionDialog({ intent: 'addScheduleTodo', errors })
  return (
    <Dialog open={dialog.open} onOpenChange={dialog.setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled || sources.length === 0}>
          <Plus /> {m.schedule_add_todo()}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.schedule_add_today_title({ name: learnerName })}</DialogTitle>
          <DialogDescription>
            {m.schedule_add_today_description({ date: displayDate(scheduledDate) })}
          </DialogDescription>
        </DialogHeader>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="addScheduleTodo" />
          <input type="hidden" name="learnerId" value={learnerId} />
          <input type="hidden" name="scheduledDate" value={scheduledDate} />
          <div className="space-y-2">
            <Label htmlFor="schedule-add-source">{m.schedule_source()}</Label>
            <NativeSelect id="schedule-add-source" name="source" className="w-full" required>
              <NativeSelectOption value="">{m.schedule_choose_source()}</NativeSelectOption>
              {sources.map((source) => (
                <NativeSelectOption
                  key={`${source.sourceType}:${source.id}`}
                  value={`${source.sourceType}:${source.id}`}
                >
                  {source.title} · {source.detail}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {errors?.sourceId?.[0] || errors?.sourceType?.[0] ? (
              <p className="text-sm text-destructive">
                {errors.sourceId?.[0] ?? errors.sourceType?.[0]}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule-add-duration">{m.schedule_planned_minutes()}</Label>
            <Input
              id="schedule-add-duration"
              name="plannedDurationMinutes"
              type="number"
              min="1"
              max="1440"
              defaultValue="30"
              required
            />
            {errors?.plannedDurationMinutes?.[0] ? (
              <p className="text-sm text-destructive">{errors.plannedDurationMinutes[0]}</p>
            ) : null}
          </div>
          {errors?.form?.[0] ? <p className="text-sm text-destructive">{errors.form[0]}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => dialog.setOpen(false)}>
              {m.schedule_cancel()}
            </Button>
            <Button type="submit" disabled={dialog.isSubmitting}>
              {m.schedule_add_to_today()}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

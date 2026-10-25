import { ChevronDown, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Form } from 'react-router'
import { Button } from '~/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
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
import { Textarea } from '~/components/ui/textarea'
import { useActionDialog } from '~/hooks/use-action-dialog'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'

function ErrorText({ value }: { value?: string }) {
  return value ? <p className="text-sm text-destructive">{value}</p> : null
}

export function CreateActivityDialog({
  trackId,
  topicName,
  today,
  errors,
  defaultOpen = false,
  learnerId,
  scheduleTodoId,
  defaultDurationMinutes,
  defaultTitle,
  triggerLabel,
}: {
  trackId: string
  topicName: string
  today: string
  errors?: Record<string, string[] | undefined>
  defaultOpen?: boolean
  learnerId?: string
  scheduleTodoId?: string
  defaultDurationMinutes?: number
  defaultTitle?: string
  triggerLabel?: string
}) {
  const dialog = useActionDialog({ intent: 'createActivity', errors, defaultOpen })
  const hasOptionalErrors = Boolean(
    errors?.durationMinutes?.[0] || errors?.value?.[0] || errors?.unit?.[0] || errors?.note?.[0],
  )
  const [detailsOpen, setDetailsOpen] = useState(hasOptionalErrors)
  const formattedToday = new Intl.DateTimeFormat(getLocale(), {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(`${today}T00:00:00Z`))

  useEffect(() => {
    if (hasOptionalErrors) setDetailsOpen(true)
  }, [hasOptionalErrors])

  return (
    <Dialog open={dialog.open} onOpenChange={dialog.setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <Plus /> {triggerLabel ?? m.activity_topic_add_log()}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{m.activity_topic_add_log()}</DialogTitle>
          <DialogDescription>
            {m.activity_topic_log_description({ topic: topicName })}
          </DialogDescription>
        </DialogHeader>
        <Form method="post" className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="intent" value="createActivity" />
          <input type="hidden" name="trackId" value={trackId} />
          <input type="hidden" name="activityDate" value={today} />
          {learnerId ? <input type="hidden" name="learnerId" value={learnerId} /> : null}
          {scheduleTodoId ? (
            <input type="hidden" name="scheduleTodoId" value={scheduleTodoId} />
          ) : null}
          <div className="space-y-2">
            <Label htmlFor={`activity-title-${trackId}`}>{m.activity_title()}</Label>
            <Input
              id={`activity-title-${trackId}`}
              name="title"
              placeholder={m.activity_title_placeholder()}
              defaultValue={defaultTitle}
              autoFocus
              required
            />
            <ErrorText value={errors?.title?.[0]} />
          </div>
          <div className="self-start sm:text-right">
            <p className="text-xs font-medium text-muted-foreground">{m.activity_date()}</p>
            <p className="text-sm font-medium">{formattedToday}</p>
            <ErrorText value={errors?.activityDate?.[0]} />
          </div>
          <Collapsible
            className="group/details sm:col-span-2"
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
          >
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" className="w-full justify-between px-0">
                {m.activity_optional_details()}
                <ChevronDown className="transition-transform duration-200 group-data-[state=open]/details:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent
              forceMount
              inert={!detailsOpen}
              aria-hidden={!detailsOpen}
              className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out data-[state=open]:grid-rows-[1fr] data-[state=open]:opacity-100"
            >
              <div className="min-h-0 overflow-hidden">
                <div className="grid gap-4 pt-2 sm:grid-cols-2">
                  <div className="space-y-2  sm:col-span-2">
                    <Label htmlFor={`activity-duration-${trackId}`}>{m.activity_duration()}</Label>
                    <Input
                      id={`activity-duration-${trackId}`}
                      name="durationMinutes"
                      type="number"
                      min="1"
                      defaultValue={defaultDurationMinutes}
                    />
                    <ErrorText value={errors?.durationMinutes?.[0]} />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor={`activity-value-${trackId}`}>{m.activity_amount()}</Label>
                    <Input id={`activity-value-${trackId}`} name="value" type="number" min="1" />
                    <ErrorText value={errors?.value?.[0]} />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor={`activity-unit-${trackId}`}>{m.activity_unit()}</Label>
                    <Input
                      id={`activity-unit-${trackId}`}
                      name="unit"
                      placeholder={m.activity_unit_placeholder()}
                    />
                    <ErrorText value={errors?.unit?.[0]} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`activity-note-${trackId}`}>{m.activity_note()}</Label>
                    <Textarea
                      id={`activity-note-${trackId}`}
                      name="note"
                      placeholder={m.activity_note_placeholder()}
                    />
                    <ErrorText value={errors?.note?.[0]} />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" disabled={dialog.isSubmitting}>
              {m.activity_save()}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Form } from 'react-router'
import { Button } from '~/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib/utils'
import * as m from '~/paraglide/messages.js'

interface GoalProgressFormProps {
  goalId: string
  learnerId?: string
  unit: string
  errors?: Record<string, string[] | undefined>
  className?: string
  scheduleTodoId?: string
  defaultDurationMinutes?: number
  activityDate?: string
}

function ErrorText({ value }: { value?: string }) {
  return value ? <p className="text-sm text-destructive">{value}</p> : null
}

export function GoalProgressForm({
  goalId,
  learnerId,
  unit,
  errors,
  className,
  scheduleTodoId,
  defaultDurationMinutes,
  activityDate,
}: GoalProgressFormProps) {
  const hasOptionalErrors = Boolean(errors?.durationMinutes?.[0] || errors?.note?.[0])
  const [detailsOpen, setDetailsOpen] = useState(hasOptionalErrors)

  useEffect(() => {
    if (hasOptionalErrors) setDetailsOpen(true)
  }, [hasOptionalErrors])

  return (
    <Form method="post" className={cn('grid gap-4 sm:grid-cols-2', className)}>
      <input type="hidden" name="intent" value="saveProgressEntry" />
      <input type="hidden" name="goalId" value={goalId} />
      {scheduleTodoId ? <input type="hidden" name="scheduleTodoId" value={scheduleTodoId} /> : null}
      {activityDate ? <input type="hidden" name="activityDate" value={activityDate} /> : null}
      {learnerId ? <input type="hidden" name="learnerId" value={learnerId} /> : null}
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`entry-value-${goalId}`}>{m.goal_amount_with_unit({ unit })}</Label>
        <div className="flex">
          <Input
            id={`entry-value-${goalId}`}
            name="value"
            type="number"
            min="1"
            max="1000000"
            required
            className="rounded-r-none"
          />
          <span className="flex items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
            {unit}
          </span>
        </div>
        <ErrorText value={errors?.value?.[0]} />
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
              <div className="space-y-2">
                <Label htmlFor={`entry-duration-${goalId}`}>{m.activity_duration()}</Label>
                <Input
                  id={`entry-duration-${goalId}`}
                  name="durationMinutes"
                  type="number"
                  min="1"
                  max="100000"
                  defaultValue={defaultDurationMinutes}
                />
                <ErrorText value={errors?.durationMinutes?.[0]} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`entry-note-${goalId}`}>{m.goal_note()}</Label>
                <Textarea
                  id={`entry-note-${goalId}`}
                  name="note"
                  placeholder={m.goal_optional_note()}
                />
                <ErrorText value={errors?.note?.[0]} />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      <div className="space-y-2 sm:col-span-2">
        <ErrorText value={errors?.form?.[0]} />
        <Button type="submit">{m.goal_save_progress_entry()}</Button>
      </div>
    </Form>
  )
}

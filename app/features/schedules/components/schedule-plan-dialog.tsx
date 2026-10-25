import { ArrowDown, ArrowUp, GripVertical, Plus, Repeat2, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
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
import type { TScheduleItem } from '~/db/schema'
import { useActionDialog } from '~/hooks/use-action-dialog'
import * as m from '~/paraglide/messages.js'
import type { SchedulePlanInputItem, ScheduleSourceOption } from '../types'

function itemSourceId(item: TScheduleItem): string {
  return item.sourceType === 'goal' ? (item.goalId ?? '') : (item.trackId ?? '')
}

export function SchedulePlanDialog({
  learnerId,
  planItems,
  sources,
  startsOn,
  timezone,
  errors,
}: {
  learnerId: string
  planItems: TScheduleItem[]
  sources: ScheduleSourceOption[]
  startsOn: string
  timezone: string
  errors?: Record<string, string[] | undefined>
}) {
  const dialog = useActionDialog({
    intent: 'saveSchedulePlan',
    errors,
    defaultOpen: Boolean(errors),
  })
  const [items, setItems] = useState<SchedulePlanInputItem[]>(
    planItems.flatMap((item) => {
      const sourceId = itemSourceId(item)
      return sourceId
        ? [
            {
              sourceType: item.sourceType,
              sourceId,
              plannedDurationMinutes: item.plannedDurationMinutes,
            },
          ]
        : []
    }),
  )
  const [sourceValue, setSourceValue] = useState('')
  const [duration, setDuration] = useState(30)
  const sourceByKey = useMemo(
    () => new Map(sources.map((source) => [`${source.sourceType}:${source.id}`, source])),
    [sources],
  )
  const availableSources = sources.filter(
    (source) => !items.some((item) => source.id === item.sourceId),
  )
  const totalMinutes = items.reduce((total, item) => total + item.plannedDurationMinutes, 0)

  function addItem() {
    const source = sourceByKey.get(sourceValue)
    if (!source || duration < 1) return
    setItems((current) => [
      ...current,
      {
        sourceType: source.sourceType,
        sourceId: source.id,
        plannedDurationMinutes: duration,
      },
    ])
    setSourceValue('')
    setDuration(30)
  }

  function moveItem(index: number, amount: number) {
    const destination = index + amount
    if (destination < 0 || destination >= items.length) return
    setItems((current) => {
      const next = [...current]
      ;[next[index], next[destination]] = [next[destination], next[index]]
      return next
    })
  }

  return (
    <Dialog open={dialog.open} onOpenChange={dialog.setOpen}>
      <DialogTrigger asChild>
        <Button variant={planItems.length === 0 ? 'default' : 'outline'}>
          <Repeat2 />
          {planItems.length === 0
            ? m.schedule_create_repeating_plan()
            : m.schedule_edit_repeating_plan()}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{m.schedule_edit_repeating_plan()}</DialogTitle>
          <DialogDescription>{m.schedule_plan_change_scope()}</DialogDescription>
        </DialogHeader>

        <Form method="post" className="space-y-5">
          <input type="hidden" name="intent" value="saveSchedulePlan" />
          <input type="hidden" name="learnerId" value={learnerId} />
          <input type="hidden" name="startsOn" value={startsOn} />
          <input type="hidden" name="timezone" value={timezone} />
          <input type="hidden" name="items" value={JSON.stringify(items)} />

          <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="schedule-plan-source">{m.schedule_source()}</Label>
              <NativeSelect
                id="schedule-plan-source"
                className="w-full"
                value={sourceValue}
                onChange={(event) => setSourceValue(event.target.value)}
              >
                <NativeSelectOption value="">{m.schedule_choose_source()}</NativeSelectOption>
                {availableSources.map((source) => (
                  <NativeSelectOption
                    key={`${source.sourceType}:${source.id}`}
                    value={`${source.sourceType}:${source.id}`}
                  >
                    {source.title} · {source.detail}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2 sm:w-36">
              <Label htmlFor="schedule-plan-duration">{m.schedule_planned_minutes()}</Label>
              <Input
                id="schedule-plan-duration"
                type="number"
                min="1"
                max="1440"
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
              />
            </div>
            <Button type="button" variant="secondary" onClick={addItem} disabled={!sourceValue}>
              <Plus /> {m.schedule_add_to_plan()}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {m.schedule_recurring_count({ count: items.length })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {m.schedule_plan_editor_description()}
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {m.schedule_minutes_count({ count: totalMinutes })}
              </span>
            </div>

            {items.map((item, index) => {
              const source = sourceByKey.get(`${item.sourceType}:${item.sourceId}`)
              return (
                <div
                  key={`${item.sourceType}:${item.sourceId}`}
                  className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[auto_minmax(0,1fr)_7rem_auto] sm:items-center"
                >
                  <GripVertical className="hidden size-4 text-muted-foreground sm:block" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{source?.title}</p>
                    <p className="text-xs text-muted-foreground">{source?.detail}</p>
                  </div>
                  <Input
                    aria-label={m.schedule_planned_minutes()}
                    type="number"
                    min="1"
                    max="1440"
                    value={item.plannedDurationMinutes}
                    onChange={(event) =>
                      setItems((current) =>
                        current.map((currentItem, currentIndex) =>
                          currentIndex === index
                            ? {
                                ...currentItem,
                                plannedDurationMinutes: Number(event.target.value),
                              }
                            : currentItem,
                        ),
                      )
                    }
                  />
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={m.schedule_move_up({ title: source?.title ?? '' })}
                      disabled={index === 0}
                      onClick={() => moveItem(index, -1)}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={m.schedule_move_down({ title: source?.title ?? '' })}
                      disabled={index === items.length - 1}
                      onClick={() => moveItem(index, 1)}
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={m.schedule_remove({ title: source?.title ?? '' })}
                      onClick={() =>
                        setItems((current) =>
                          current.filter((_, currentIndex) => currentIndex !== index),
                        )
                      }
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {errors?.items?.[0] || errors?.form?.[0] ? (
            <p className="text-sm text-destructive">{errors.items?.[0] ?? errors.form?.[0]}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">{m.schedule_plan_history_note()}</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => dialog.setOpen(false)}>
              {m.schedule_cancel()}
            </Button>
            <Button type="submit" disabled={dialog.isSubmitting || items.length === 0}>
              {m.schedule_save_repeating_plan()}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

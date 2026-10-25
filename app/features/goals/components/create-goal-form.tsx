import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Form } from 'react-router'
import { Button } from '~/components/ui/button'
import { DatePicker } from '~/components/ui/date-picker'
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
import { Textarea } from '~/components/ui/textarea'
import type { TGoalGroup } from '~/db/schema'
import { useActionDialog } from '~/hooks/use-action-dialog'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import {
  calculateGoalEndDate,
  type GoalDurationUnit,
  isGoalDateValue,
} from '../utils/goal-duration'

interface CreateGoalFormProps {
  errors?: Record<string, string[] | undefined>
  defaultOpen?: boolean
  groups?: TGoalGroup[]
}

function ErrorText({ value }: { value?: string }) {
  return value ? <p className="text-sm text-destructive">{value}</p> : null
}

export function CreateGoalForm({ errors, defaultOpen = false, groups = [] }: CreateGoalFormProps) {
  const dialog = useActionDialog({ intent: 'createGoal', errors, defaultOpen })
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const [startDate, setStartDate] = useState(today)
  const [durationValue, setDurationValue] = useState(30)
  const [durationUnit, setDurationUnit] = useState<GoalDurationUnit>('days')
  const maximumDuration = durationUnit === 'days' ? 3650 : 120
  const endDate = useMemo(
    () =>
      isGoalDateValue(startDate) &&
      Number.isInteger(durationValue) &&
      durationValue >= 1 &&
      durationValue <= maximumDuration
        ? calculateGoalEndDate(startDate, durationValue, durationUnit)
        : undefined,
    [durationUnit, durationValue, maximumDuration, startDate],
  )
  const formattedEndDate = endDate
    ? new Intl.DateTimeFormat(getLocale(), {
        dateStyle: 'long',
        timeZone: 'UTC',
      }).format(new Date(`${endDate}T00:00:00.000Z`))
    : '—'

  return (
    <Dialog open={dialog.open} onOpenChange={dialog.setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> {m.goal_add()}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.goal_create_title()}</DialogTitle>
          <DialogDescription>{m.goal_create_description()}</DialogDescription>
        </DialogHeader>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="createGoal" />
          <div className="space-y-2">
            <Label htmlFor="goal-title">{m.goal_title()}</Label>
            <Input id="goal-title" name="title" placeholder={m.goal_title_placeholder()} required />
            <ErrorText value={errors?.title?.[0]} />
          </div>
          {groups.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="goal-group">{m.goal_group_name()}</Label>
              <NativeSelect id="goal-group" name="groupId" className="w-full">
                <NativeSelectOption value="">{m.goal_group_ungrouped()}</NativeSelectOption>
                {groups.map((group) => (
                  <NativeSelectOption key={group.id} value={group.id}>
                    {group.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <ErrorText value={errors?.groupId?.[0]} />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="goal-description">{m.goal_description()}</Label>
            <Textarea
              id="goal-description"
              name="description"
              placeholder={m.goal_optional_notes()}
            />
            <ErrorText value={errors?.description?.[0]} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="goal-target">{m.goal_target()}</Label>
              <Input id="goal-target" name="targetValue" type="number" min="1" defaultValue="1" />
              <ErrorText value={errors?.targetValue?.[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-unit">{m.goal_unit()}</Label>
              <Input id="goal-unit" name="unit" placeholder={m.goal_unit_placeholder()} required />
              <ErrorText value={errors?.unit?.[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-start">{m.goal_start_date()}</Label>
              <DatePicker
                id="goal-start"
                name="startDate"
                placeholder={m.goal_choose_start_date()}
                invalid={Boolean(errors?.startDate?.[0])}
                defaultValue={today}
                onValueChange={setStartDate}
              />
              <ErrorText value={errors?.startDate?.[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-duration">{m.goal_duration()}</Label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Input
                  id="goal-duration"
                  name="durationValue"
                  type="number"
                  min="1"
                  max={maximumDuration}
                  value={durationValue}
                  onChange={(event) =>
                    setDurationValue(Math.max(1, event.currentTarget.valueAsNumber || 1))
                  }
                  aria-invalid={Boolean(errors?.durationValue?.[0])}
                  required
                />
                <NativeSelect
                  name="durationUnit"
                  aria-label={m.goal_duration_unit()}
                  value={durationUnit}
                  onChange={(event) =>
                    setDurationUnit(event.currentTarget.value as GoalDurationUnit)
                  }
                >
                  <NativeSelectOption value="days">{m.goal_duration_days()}</NativeSelectOption>
                  <NativeSelectOption value="months">{m.goal_duration_months()}</NativeSelectOption>
                </NativeSelect>
              </div>
              <ErrorText value={errors?.durationValue?.[0] ?? errors?.durationUnit?.[0]} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{m.goal_end_date()}</Label>
              <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm" aria-live="polite">
                {formattedEndDate}
              </p>
              <p className="text-xs text-muted-foreground">{m.goal_end_date_calculated()}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{m.goal_create_action()}</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

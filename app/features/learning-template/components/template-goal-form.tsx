import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'
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
import { Textarea } from '~/components/ui/textarea'
import type { TLearningTemplateGoal } from '~/db/schema'
import * as m from '~/paraglide/messages.js'
import { FieldError } from './field-error'

export function TemplateGoalForm({
  errors,
  defaultOpen,
  goal,
  trigger,
}: {
  errors?: Record<string, string[] | undefined>
  defaultOpen?: boolean
  goal?: TLearningTemplateGoal
  trigger?: ReactNode
}) {
  const suffix = goal?.id ?? 'new'
  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus /> {m.learning_template_add_goal()}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {goal ? m.learning_template_edit_goal() : m.learning_template_add_goal()}
          </DialogTitle>
          <DialogDescription>{m.learning_template_goal_form_description()}</DialogDescription>
        </DialogHeader>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value={goal ? 'editGoal' : 'addGoal'} />
          {goal ? <input type="hidden" name="goalId" value={goal.id} /> : null}
          <div className="space-y-2">
            <Label htmlFor={`template-goal-title-${suffix}`}>{m.goal_title()}</Label>
            <Input
              id={`template-goal-title-${suffix}`}
              name="title"
              defaultValue={goal?.title ?? ''}
              required
            />
            <FieldError value={errors?.title?.[0]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`template-goal-description-${suffix}`}>{m.goal_description()}</Label>
            <Textarea
              id={`template-goal-description-${suffix}`}
              name="description"
              defaultValue={goal?.description ?? ''}
            />
            <FieldError value={errors?.description?.[0]} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor={`template-goal-target-${suffix}`}>{m.goal_target()}</Label>
              <Input
                id={`template-goal-target-${suffix}`}
                name="targetValue"
                type="number"
                min="1"
                defaultValue={goal?.targetValue ?? 1}
              />
              <FieldError value={errors?.targetValue?.[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`template-goal-unit-${suffix}`}>{m.goal_unit()}</Label>
              <Input
                id={`template-goal-unit-${suffix}`}
                name="unit"
                defaultValue={goal?.unit ?? ''}
                required
              />
              <FieldError value={errors?.unit?.[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`template-goal-duration-${suffix}`}>
                {m.learning_template_duration_days()}
              </Label>
              <Input
                id={`template-goal-duration-${suffix}`}
                name="durationDays"
                type="number"
                min="1"
                defaultValue={goal?.durationDays ?? 30}
              />
              <FieldError value={errors?.durationDays?.[0]} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {goal ? m.learning_template_save_goal() : m.learning_template_add_goal()}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

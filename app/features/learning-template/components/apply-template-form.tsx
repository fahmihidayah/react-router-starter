import { CopyPlus } from 'lucide-react'
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
import { Label } from '~/components/ui/label'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import type { TLearner } from '~/db/schema'
import * as m from '~/paraglide/messages.js'
import { FieldError } from './field-error'

export function ApplyTemplateForm({
  learners,
  errors,
  duplicate,
  defaultOpen,
  disabled,
}: {
  learners: TLearner[]
  errors?: Record<string, string[] | undefined>
  duplicate?: boolean
  defaultOpen?: boolean
  disabled?: boolean
}) {
  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled || learners.length === 0}>
          <CopyPlus /> {m.learning_template_apply()}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.learning_template_apply_title()}</DialogTitle>
          <DialogDescription>{m.learning_template_apply_description()}</DialogDescription>
        </DialogHeader>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="apply" />
          {duplicate ? <input type="hidden" name="confirmDuplicate" value="true" /> : null}
          <div className="space-y-2">
            <Label htmlFor="template-learner">{m.learning_template_learner()}</Label>
            <NativeSelect id="template-learner" name="learnerId" className="w-full" required>
              <NativeSelectOption value="">
                {m.learning_template_choose_learner()}
              </NativeSelectOption>
              {learners.map((learner) => (
                <NativeSelectOption key={learner.id} value={learner.id}>
                  {learner.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldError value={errors?.learnerId?.[0]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-start-date">{m.goal_start_date()}</Label>
            <DatePicker
              id="template-start-date"
              name="startDate"
              placeholder={m.goal_choose_start_date()}
            />
            <FieldError value={errors?.startDate?.[0]} />
          </div>
          {errors?.form?.[0] ? (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errors.form[0]}
            </p>
          ) : null}
          {duplicate ? (
            <p className="text-sm font-medium">{m.learning_template_duplicate_confirm()}</p>
          ) : null}
          <DialogFooter>
            <Button type="submit">
              {duplicate ? m.learning_template_apply_again() : m.learning_template_apply()}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

import { subYears } from 'date-fns'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { DatePicker } from '~/components/ui/date-picker'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { TLearner } from '~/db/schema'
import * as m from '~/paraglide/messages.js'
import { LearnerAvatarField } from './learner-avatar-field'

interface LearnerFormProps {
  learner?: TLearner
  errors?: Record<string, string[] | undefined>
}

function FieldError({ error, id }: { error?: string; id: string }) {
  if (!error) return null
  return (
    <p id={id} className="text-sm text-destructive">
      {error}
    </p>
  )
}

export function LearnerForm({ learner, errors }: LearnerFormProps) {
  const nameError = errors?.name?.[0]
  const dateError = errors?.dateOfBirth?.[0]
  const avatarError = errors?.avatar?.[0]
  const today = new Date()

  return (
    <form method="post" encType="multipart/form-data" className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <LearnerAvatarField currentUrl={learner?.avatar} error={avatarError} />

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">{m.learner_name()}</Label>
          <Input
            id="name"
            name="name"
            placeholder={m.learner_name_placeholder()}
            defaultValue={learner?.name ?? ''}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? 'name-error' : undefined}
            required
          />
          <FieldError error={nameError} id="name-error" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">{m.learner_date_of_birth()}</Label>
          <DatePicker
            id="dateOfBirth"
            name="dateOfBirth"
            placeholder={m.learner_date_of_birth_placeholder()}
            defaultValue={learner?.dateOfBirth?.toISOString().slice(0, 10) ?? ''}
            defaultMonth={subYears(today, 10)}
            startMonth={subYears(today, 100)}
            endMonth={today}
            captionLayout="dropdown"
            invalid={Boolean(dateError)}
            describedBy={dateError ? 'date-error' : undefined}
          />
          <FieldError error={dateError} id="date-error" />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button asChild variant="outline" type="button">
          <Link to={learner ? `/track-app/learners/${learner.id}` : '/track-app/learners'}>
            {m.learner_cancel()}
          </Link>
        </Button>
        <Button type="submit">{learner ? m.learner_save_changes() : m.learner_create()}</Button>
      </div>
    </form>
  )
}

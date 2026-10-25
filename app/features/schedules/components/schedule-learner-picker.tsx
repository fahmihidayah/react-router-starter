import { useNavigate, useSearchParams } from 'react-router'
import { Label } from '~/components/ui/label'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import * as m from '~/paraglide/messages.js'

export type ScheduleLearnerOption = {
  id: string
  name: string
  groupName: string | null
}

export function ScheduleLearnerPicker({
  learners,
  selectedLearnerId,
}: {
  learners: ScheduleLearnerOption[]
  selectedLearnerId: string
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  return (
    <div className="space-y-2">
      <Label htmlFor="schedule-learner">{m.schedule_switch_learner()}</Label>
      <NativeSelect
        id="schedule-learner"
        className="min-w-56"
        value={selectedLearnerId}
        onChange={(event) => {
          const next = new URLSearchParams(searchParams)
          next.set('learnerId', event.target.value)
          navigate(`/track-app/schedule?${next.toString()}`)
        }}
      >
        <NativeSelectOption value="">{m.schedule_choose_learner()}</NativeSelectOption>
        {learners.map((learner) => (
          <NativeSelectOption key={learner.id} value={learner.id}>
            {learner.name}
            {learner.groupName ? ` · ${learner.groupName}` : ''}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  )
}

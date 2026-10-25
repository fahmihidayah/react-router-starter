import { BookOpenCheck } from 'lucide-react'
import { useState } from 'react'
import { Form, Link } from 'react-router'
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
import { Textarea } from '~/components/ui/textarea'
import { useActionDialog } from '~/hooks/use-action-dialog'
import * as m from '~/paraglide/messages.js'
import type { LearnerWithActivityTracks } from '../types'

export function DashboardActivityForm({
  learners,
  today,
  errors,
  defaultOpen,
}: {
  learners: LearnerWithActivityTracks[]
  today: string
  errors?: Record<string, string[] | undefined>
  defaultOpen?: boolean
}) {
  const initialLearnerId = learners.length === 1 ? learners[0].id : ''
  const [learnerId, setLearnerId] = useState(initialLearnerId)
  const selectedLearner = learners.find((learner) => learner.id === learnerId)
  const dialog = useActionDialog({ intent: 'createActivity', errors, defaultOpen })
  const error = (name: string) => errors?.[name]?.[0]

  return (
    <Dialog open={dialog.open} onOpenChange={dialog.setOpen}>
      <DialogTrigger asChild>
        <Button disabled={learners.length === 0}>
          <BookOpenCheck /> {m.activity_log_learning()}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{m.activity_log_learning()}</DialogTitle>
          <DialogDescription>{m.activity_form_description()}</DialogDescription>
        </DialogHeader>
        <Form method="post" className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="intent" value="createActivity" />
          <div className="space-y-2">
            <Label htmlFor="dashboard-activity-learner">{m.activity_learner()}</Label>
            <NativeSelect
              id="dashboard-activity-learner"
              name="learnerId"
              className="w-full"
              value={learnerId}
              onChange={(event) => setLearnerId(event.target.value)}
              required
            >
              <NativeSelectOption value="">{m.activity_choose_learner()}</NativeSelectOption>
              {learners.map((learner) => (
                <NativeSelectOption key={learner.id} value={learner.id}>
                  {learner.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {error('learnerId') ? (
              <p className="text-sm text-destructive">{error('learnerId')}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dashboard-activity-track">{m.activity_track()}</Label>
            <NativeSelect
              key={learnerId}
              id="dashboard-activity-track"
              name="trackId"
              className="w-full"
              disabled={!selectedLearner || selectedLearner.tracks.length === 0}
              required
            >
              <NativeSelectOption value="">{m.activity_choose_topic()}</NativeSelectOption>
              {selectedLearner?.tracks.map((track) => (
                <NativeSelectOption key={track.id} value={track.id}>
                  {track.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {error('trackId') ? (
              <p className="text-sm text-destructive">{error('trackId')}</p>
            ) : null}
          </div>
          {selectedLearner && selectedLearner.tracks.length === 0 ? (
            <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground sm:col-span-2">
              {m.activity_no_topics_for_learner()}{' '}
              <Link
                to={`/track-app/learners/${selectedLearner.id}?tab=activities`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                {m.activity_create_topic_first()}
              </Link>
            </p>
          ) : null}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="dashboard-activity-title">{m.activity_title()}</Label>
            <Input
              id="dashboard-activity-title"
              name="title"
              placeholder={m.activity_title_placeholder()}
              required
            />
            {error('title') ? <p className="text-sm text-destructive">{error('title')}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dashboard-activity-date">{m.activity_date()}</Label>
            <Input
              id="dashboard-activity-date"
              name="activityDate"
              type="date"
              defaultValue={today}
              required
            />
            {error('activityDate') ? (
              <p className="text-sm text-destructive">{error('activityDate')}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dashboard-activity-duration">{m.activity_duration()}</Label>
            <Input id="dashboard-activity-duration" name="durationMinutes" type="number" min="1" />
            {error('durationMinutes') ? (
              <p className="text-sm text-destructive">{error('durationMinutes')}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dashboard-activity-value">{m.activity_amount()}</Label>
            <Input id="dashboard-activity-value" name="value" type="number" min="1" />
            {error('value') ? <p className="text-sm text-destructive">{error('value')}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dashboard-activity-unit">{m.activity_unit()}</Label>
            <Input
              id="dashboard-activity-unit"
              name="unit"
              placeholder={m.activity_unit_placeholder()}
            />
            {error('unit') ? <p className="text-sm text-destructive">{error('unit')}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="dashboard-activity-note">{m.activity_note()}</Label>
            <Textarea
              id="dashboard-activity-note"
              name="note"
              placeholder={m.activity_note_placeholder()}
            />
            {error('note') ? <p className="text-sm text-destructive">{error('note')}</p> : null}
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button
              type="submit"
              disabled={
                dialog.isSubmitting || !selectedLearner || selectedLearner.tracks.length === 0
              }
            >
              {m.activity_save()}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

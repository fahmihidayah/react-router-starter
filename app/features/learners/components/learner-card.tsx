import { GripVertical, Pencil } from 'lucide-react'
import type { RefCallback } from 'react'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import type { LearnerListItem } from '../types'
import { DeleteLearnerDialog } from './delete-learner-dialog'

export function LearnerCard({
  learner,
  dragHandleRef,
  isDragging = false,
}: {
  learner: LearnerListItem
  dragHandleRef?: RefCallback<Element>
  isDragging?: boolean
}) {
  const dateFormatter = new Intl.DateTimeFormat(getLocale(), {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })

  return (
    <Card className={`overflow-hidden transition-opacity ${isDragging ? 'opacity-40' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="mb-2 flex size-12 items-center justify-center overflow-hidden rounded-full bg-muted text-lg font-semibold">
            {learner.avatar ? (
              <img
                src={learner.avatar}
                alt=""
                className="size-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              learner.name.charAt(0).toUpperCase()
            )}
          </div>
          {dragHandleRef ? (
            <Button
              ref={dragHandleRef}
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={m.learner_group_drag_named({ name: learner.name })}
              className="cursor-grab touch-none active:cursor-grabbing"
            >
              <GripVertical />
            </Button>
          ) : null}
        </div>
        <CardTitle>{learner.name}</CardTitle>
        <CardDescription>
          {learner.dateOfBirth
            ? m.learner_born_date({ date: dateFormatter.format(learner.dateOfBirth) })
            : m.learner_date_of_birth_not_set()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link to={`/track-app/learners/${learner.id}`}>
            <Pencil /> {m.learner_view_details()}
          </Link>
        </Button>
        {learner.role === 'owner' ? (
          <DeleteLearnerDialog
            learner={learner}
            includeLearnerId
            trigger={<Button variant="destructive">{m.learner_delete()}</Button>}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}

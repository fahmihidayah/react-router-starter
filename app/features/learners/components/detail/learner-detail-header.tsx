import { CalendarDays, Clock3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import type { TLearner } from '~/db/schema'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'

interface LearnerDetailHeaderProps {
  learner: TLearner
}

export function LearnerDetailHeader({ learner }: LearnerDetailHeaderProps) {
  const dateFormatter = new Intl.DateTimeFormat(getLocale(), {
    dateStyle: 'long',
    timeZone: 'UTC',
  })

  return (
    <Card>
      <CardHeader className="sm:grid-cols-[auto_1fr] sm:items-center sm:gap-x-5">
        <div className="row-span-2 flex size-20 items-center justify-center overflow-hidden rounded-full bg-muted text-2xl font-semibold">
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
        <CardTitle className="text-2xl">{learner.name}</CardTitle>
        <CardDescription>{m.learner_detail_description()}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 border-t pt-6 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="size-4" />
          {learner.dateOfBirth
            ? m.learner_born_date({ date: dateFormatter.format(learner.dateOfBirth) })
            : m.learner_date_of_birth_not_set()}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock3 className="size-4" />
          {m.learner_added_date({ date: dateFormatter.format(learner.createdAt) })}
        </div>
      </CardContent>
    </Card>
  )
}

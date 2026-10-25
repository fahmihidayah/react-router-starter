import { History } from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import type { LearnerWithGoals } from '~/features/learners/types'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'

interface GoalUpdateHistoryProps {
  learners: LearnerWithGoals[]
  today: string
}

function timestamp(value: Date | string) {
  return new Date(value).getTime()
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat(getLocale(), {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value))
}

function dateKey(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10)
}

export function GoalUpdateHistory({ learners, today }: GoalUpdateHistoryProps) {
  const updates = learners
    .flatMap((learner) =>
      learner.goals.flatMap((goal) => {
        let cumulativeValue = 0

        return [...goal.entries]
          .sort((a, b) => timestamp(a.activityDate) - timestamp(b.activityDate))
          .map((entry) => {
            cumulativeValue += entry.value
            return {
              entry,
              goal,
              learner,
              progress: Math.min(100, Math.round((cumulativeValue / goal.targetValue) * 100)),
            }
          })
          .filter(({ entry }) => dateKey(entry.activityDate) === today)
      }),
    )
    .sort(
      (a, b) =>
        timestamp(b.entry.activityDate) - timestamp(a.entry.activityDate) ||
        timestamp(b.entry.updatedAt) - timestamp(a.entry.updatedAt),
    )
    .slice(0, 8)

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-5" /> {m.goal_history_title()}
        </CardTitle>
        <CardDescription>{m.goal_history_description()}</CardDescription>
      </CardHeader>
      <CardContent>
        {updates.length === 0 ? (
          <div className="rounded-lg border border-dashed px-4 py-8 text-center">
            <p className="text-sm font-medium">{m.goal_history_empty_title()}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {m.goal_history_empty_description()}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {updates.map(({ entry, goal, learner, progress }, index) => (
              <div key={entry.id} className="relative flex gap-3">
                {index < updates.length - 1 && (
                  <div className="absolute left-[7px] top-5 h-[calc(100%+0.25rem)] w-px bg-border" />
                )}
                <div className="relative mt-1.5 size-3.5 shrink-0 rounded-full border-2 border-primary bg-background" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/track-app/learners/${learner.id}?tab=goals`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {goal.title}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{learner.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {m.goal_history_updated_by({ name: entry.recordedByName })}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {progress}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m.goal_history_entry({
                      date: formatDate(entry.activityDate),
                      value: entry.value,
                      unit: goal.unit,
                    })}
                  </p>
                  {entry.note && <p className="mt-1 line-clamp-2 text-xs">{entry.note}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

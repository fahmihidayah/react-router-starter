import { ArrowRight, BookOpenCheck, Clock3, Hash, History, Target } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import type { LearningRecordWithDetails } from '~/features/activities/types'
import type { DashboardLearner } from '~/features/track-app/types'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'

type UpdateItem = LearningRecordWithDetails & { learner: DashboardLearner }

function formatTimestamp(value: Date | string) {
  return new Intl.DateTimeFormat(getLocale(), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function UpdateList({ items }: { items: UpdateItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-4 py-10 text-center">
        <p className="font-medium">{m.dashboard_history_empty_title()}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {m.dashboard_history_empty_description()}
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {items.map((item) => {
        const isGoal = Boolean(item.goalId)
        return (
          <Link
            key={item.id}
            to={`/track-app/learners/${item.learnerId}?tab=${isGoal ? 'goals' : 'activities'}`}
            className="group flex gap-3 py-4 first:pt-0 last:pb-0"
          >
            <div
              className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${
                isGoal ? 'bg-primary/10 text-primary' : 'bg-chart-4/15 text-accent-foreground'
              }`}
            >
              {isGoal ? <Target className="size-4" /> : <BookOpenCheck className="size-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold group-hover:underline">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{item.learner.name}</p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {item.durationMinutes ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="size-3" />
                    {m.activity_minutes({ count: item.durationMinutes })}
                  </span>
                ) : null}
                {item.value && item.unit ? (
                  <span className="inline-flex items-center gap-1">
                    <Hash className="size-3" />
                    {m.activity_measurement({ value: item.value, unit: item.unit })}
                  </span>
                ) : null}
                {!item.goalId && item.trackName ? <span>{item.trackName}</span> : null}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {formatTimestamp(item.createdAt)} ·{' '}
                {m.activity_recorded_by({ name: item.recordedByName })}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export function DashboardRecentUpdates({
  records,
  learners,
}: {
  records: LearningRecordWithDetails[]
  learners: DashboardLearner[]
}) {
  const learnerById = new Map(learners.map((learner) => [learner.id, learner]))
  const items = records.flatMap((record) => {
    const learner = learnerById.get(record.learnerId)
    return learner ? [{ ...record, learner }] : []
  })

  return (
    <>
      <Card className="sm:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" /> {m.dashboard_history_title()}
          </CardTitle>
          <CardDescription>{m.dashboard_history_description()}</CardDescription>
        </CardHeader>
        <CardContent>
          {items[0] ? (
            <p className="mb-4 truncate text-sm text-muted-foreground">
              {m.dashboard_latest_update({ learner: items[0].learner.name, title: items[0].title })}
            </p>
          ) : null}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <History /> {m.dashboard_view_history({ count: items.length })}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[92vw] sm:max-w-md">
              <SheetHeader className="border-b pr-12">
                <SheetTitle>{m.dashboard_history_title()}</SheetTitle>
                <SheetDescription>{m.dashboard_history_description()}</SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
                <UpdateList items={items} />
              </div>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>

      <Card className="hidden min-w-0 sm:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" /> {m.dashboard_history_title()}
          </CardTitle>
          <CardDescription>{m.dashboard_history_description()}</CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateList items={items} />
        </CardContent>
      </Card>
    </>
  )
}

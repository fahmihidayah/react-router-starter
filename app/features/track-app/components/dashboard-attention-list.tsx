import { CheckCircle2, Clock3, UsersRound } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { GoalProgressDialog } from '~/features/goals/components/goal-progress-dialog'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import type { DashboardGoalItem } from '../types'

function formatEndDate(value: Date | string) {
  return new Intl.DateTimeFormat(getLocale(), {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(value))
}

export function DashboardAttentionList({
  items,
  errorGoalId,
  entryMode,
  errors,
}: {
  items: DashboardGoalItem[]
  errorGoalId?: string
  entryMode?: 'manual' | 'pomodoro'
  errors?: Record<string, string[] | undefined>
}) {
  const groups = new Map<string, { name: string; items: DashboardGoalItem[] }>()
  for (const item of items) {
    const key = item.learner.groupId ?? 'ungrouped'
    const group = groups.get(key) ?? {
      name: item.learner.groupName ?? m.learner_group_ungrouped(),
      items: [],
    }
    group.items.push(item)
    groups.set(key, group)
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersRound className="size-5 text-primary" /> {m.dashboard_attention_title()}
        </CardTitle>
        <CardDescription>{m.dashboard_attention_description()}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed bg-accent/30 px-4 py-10 text-center">
            <CheckCircle2 className="size-9 text-chart-4" />
            <p className="mt-3 font-semibold">{m.dashboard_attention_empty_title()}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {m.dashboard_attention_empty_description()}
            </p>
          </div>
        ) : (
          <div className="max-h-[34rem] space-y-5 overflow-y-auto pr-1">
            {Array.from(groups.entries()).map(([groupId, group]) => {
              const learnerCount = new Set(group.items.map((item) => item.learner.id)).size
              return (
                <section key={groupId} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="truncate text-sm font-semibold">{group.name}</h3>
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      {m.dashboard_group_attention_count({ count: learnerCount })}
                    </span>
                  </div>
                  <div className="divide-y overflow-hidden rounded-xl border">
                    {group.items.map(({ learner, goal }) => (
                      <div
                        key={goal.id}
                        className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                      >
                        <div className="flex min-w-0 gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold">
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
                          <div className="min-w-0">
                            <Link
                              to={`/track-app/learners/${learner.id}?tab=goals`}
                              className="block truncate text-sm font-semibold hover:underline"
                            >
                              {learner.name}
                            </Link>
                            <p className="truncate text-sm text-muted-foreground">{goal.title}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock3 className="size-3" />
                              {m.dashboard_goal_ends({ date: formatEndDate(goal.endDate) })}
                              <span aria-hidden="true">·</span>
                              {goal.currentValue}/{goal.targetValue} {goal.unit}
                            </p>
                          </div>
                        </div>
                        <GoalProgressDialog
                          goalId={goal.id}
                          learnerId={learner.id}
                          goalTitle={goal.title}
                          unit={goal.unit}
                          errors={errorGoalId === goal.id ? errors : undefined}
                          defaultOpen={errorGoalId === goal.id && Boolean(errors)}
                          entryMode={errorGoalId === goal.id ? entryMode : undefined}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
        <Button asChild variant="link" className="mt-3 h-auto px-0">
          <Link to="/track-app/learners">{m.dashboard_manage_learners()}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

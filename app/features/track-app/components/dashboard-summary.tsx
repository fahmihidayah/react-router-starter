import { BookOpenCheck, CheckCircle2, Target, UsersRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card, CardContent } from '~/components/ui/card'
import * as m from '~/paraglide/messages.js'

function CompletionRing({ value }: { value: number }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div
      className="relative size-28 shrink-0"
      role="progressbar"
      aria-label={m.dashboard_completion_label({ value })}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          className="text-primary/10"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
        {value}%
      </span>
    </div>
  )
}

export function DashboardSummary({
  totalGoals,
  updatedGoals,
  learnersNeedingAttention,
  activitiesToday,
  action,
}: {
  totalGoals: number
  updatedGoals: number
  learnersNeedingAttention: number
  activitiesToday: number
  action: ReactNode
}) {
  const completion = totalGoals ? Math.round((updatedGoals / totalGoals) * 100) : 100
  const caughtUp = learnersNeedingAttention === 0

  return (
    <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary/5">
      <CardContent className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="flex justify-center sm:justify-start">
          <CompletionRing value={completion} />
        </div>
        <div className="min-w-0 space-y-4 text-center sm:text-left">
          <div>
            <p className="text-sm font-medium text-primary">{m.dashboard_today_eyebrow()}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              {totalGoals
                ? m.dashboard_today_progress({ updated: updatedGoals, total: totalGoals })
                : m.dashboard_no_active_goals()}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {caughtUp
                ? m.dashboard_all_caught_up()
                : m.dashboard_learners_need_attention({ count: learnersNeedingAttention })}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-sm sm:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary">
              <Target className="size-3.5" />
              {m.dashboard_goal_updates_count({ count: updatedGoals })}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-accent-foreground">
              <BookOpenCheck className="size-3.5" />
              {m.dashboard_activities_count({ count: activitiesToday })}
            </span>
            {caughtUp ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-chart-4/15 px-3 py-1 text-foreground">
                <CheckCircle2 className="size-3.5 text-chart-4" />
                {m.dashboard_on_track()}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                <UsersRound className="size-3.5" />
                {m.dashboard_learners_count({ count: learnersNeedingAttention })}
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">{action}</div>
      </CardContent>
    </Card>
  )
}

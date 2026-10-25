import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import type { DashboardWeeklyPoint } from '../types'

function dayLabel(date: string) {
  return new Intl.DateTimeFormat(getLocale(), { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00.000Z`),
  )
}

export function DashboardWeeklyChart({ data }: { data: DashboardWeeklyPoint[] }) {
  const totalGoalUpdates = data.reduce((total, item) => total + item.goalUpdateCount, 0)
  const totalActivities = data.reduce((total, item) => total + item.activityCount, 0)
  const maximum = Math.max(1, ...data.map((item) => item.goalUpdateCount + item.activityCount))

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" /> {m.dashboard_weekly_title()}
        </CardTitle>
        <CardDescription>
          {m.dashboard_weekly_description({
            goals: totalGoalUpdates,
            activities: totalActivities,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-52 items-end gap-2 rounded-xl border bg-muted/25 px-3 pt-5 pb-3 sm:gap-3">
          {data.map((item) => {
            const goalHeight = (item.goalUpdateCount / maximum) * 100
            const activityHeight = (item.activityCount / maximum) * 100
            return (
              <div key={item.date} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                <div
                  className="flex min-h-0 flex-1 flex-col justify-end"
                  role="img"
                  aria-label={m.dashboard_chart_day_label({
                    day: dayLabel(item.date),
                    goals: item.goalUpdateCount,
                    activities: item.activityCount,
                  })}
                >
                  <div
                    className="w-full rounded-t-md bg-chart-1 transition-[height] duration-500"
                    style={{ height: `${goalHeight}%` }}
                    title={m.dashboard_goal_updates_count({ count: item.goalUpdateCount })}
                  />
                  <div
                    className="w-full bg-chart-4 transition-[height] duration-500 last:rounded-b-md"
                    style={{ height: `${activityHeight}%` }}
                    title={m.dashboard_activities_count({ count: item.activityCount })}
                  />
                </div>
                <span className="mt-2 truncate text-center text-[11px] text-muted-foreground sm:text-xs">
                  {dayLabel(item.date)}
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-sm bg-chart-1" /> {m.dashboard_goal_updates()}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-sm bg-chart-4" /> {m.dashboard_learning_logs()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

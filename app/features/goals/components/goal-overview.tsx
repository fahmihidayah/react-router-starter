import { CheckCircle2, CircleDot, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import * as m from '~/paraglide/messages.js'
import type { GoalWithProgress } from '../types'

interface GoalOverviewProps {
  goals: GoalWithProgress[]
}

function goalPercent(goal: GoalWithProgress) {
  return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
}

export function GoalOverview({ goals }: GoalOverviewProps) {
  const completed = goals.filter((goal) => goal.currentValue >= goal.targetValue).length
  const active = goals.length - completed
  const overall = goals.length
    ? Math.round(goals.reduce((total, goal) => total + goalPercent(goal), 0) / goals.length)
    : 0
  const metrics = [
    { label: m.goal_metric_overall_progress(), value: `${overall}%`, icon: TrendingUp },
    { label: m.goal_metric_total(), value: String(goals.length), icon: Target },
    { label: m.goal_metric_in_progress(), value: String(active), icon: CircleDot },
    { label: m.goal_metric_completed(), value: String(completed), icon: CheckCircle2 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-2xl font-semibold">{metric.value}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <metric.icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{m.goal_overall_title()}</CardTitle>
          <CardDescription>{m.goal_overall_description()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {goals.length
                ? m.learner_goals_completed({ completed, total: goals.length })
                : m.learner_no_goals()}
            </span>
            <span className="font-medium">{overall}%</span>
          </div>
          <Progress
            value={overall}
            aria-label={m.goal_overall_progress_label({ percent: overall })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{m.goal_breakdown_title()}</CardTitle>
          <CardDescription>{m.goal_breakdown_description()}</CardDescription>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {m.goal_breakdown_empty()}
            </p>
          ) : (
            <div className="space-y-5">
              {goals.map((goal) => {
                const percent = goalPercent(goal)
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="truncate font-medium">{goal.title}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {goal.currentValue}/{goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <Progress
                      value={percent}
                      aria-label={m.goal_progress_label({ title: goal.title, percent })}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

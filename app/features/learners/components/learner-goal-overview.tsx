import { ArrowRight, CheckCircle2, Clock3, MinusCircle, Target } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import * as m from '~/paraglide/messages.js'
import type { LearnerWithGoals } from '../types'

interface LearnerGoalOverviewProps {
  learners: LearnerWithGoals[]
  today: string
}

function goalPercent(currentValue: number, targetValue: number) {
  return Math.min(100, Math.round((currentValue / targetValue) * 100))
}

function dateKey(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10)
}

export function LearnerGoalOverview({ learners, today }: LearnerGoalOverviewProps) {
  if (learners.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="rounded-full bg-muted p-3">
            <Target className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{m.learner_empty_title()}</p>
            <p className="text-sm text-muted-foreground">{m.learner_goal_empty_description()}</p>
          </div>
          <Button asChild size="sm">
            <Link to="/track-app/learners/new">{m.learner_add()}</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {learners.map((learner) => {
        const completed = learner.goals.filter(
          (goal) => goal.currentValue >= goal.targetValue,
        ).length
        const activeGoals = learner.goals.filter(
          (goal) => dateKey(goal.startDate) <= today && dateKey(goal.endDate) >= today,
        )
        const dueGoals = activeGoals.filter(
          (goal) =>
            goal.currentValue < goal.targetValue &&
            !goal.entries.some((entry) => dateKey(entry.activityDate) === today),
        )
        const updatedToday = activeGoals.some((goal) =>
          goal.entries.some((entry) => dateKey(entry.activityDate) === today),
        )
        const overall = activeGoals.length
          ? Math.round(
              activeGoals.reduce(
                (total, goal) => total + goalPercent(goal.currentValue, goal.targetValue),
                0,
              ) / activeGoals.length,
            )
          : completed > 0
            ? 100
            : 0
        const status = dueGoals.length
          ? {
              label: m.dashboard_status_needs_update(),
              icon: Clock3,
              className: 'bg-chart-3/15 text-foreground',
            }
          : updatedToday
            ? {
                label: m.dashboard_status_updated_today(),
                icon: CheckCircle2,
                className: 'bg-chart-4/15 text-foreground',
              }
            : {
                label: m.dashboard_status_no_active_goal(),
                icon: MinusCircle,
                className: 'bg-muted text-muted-foreground',
              }

        return (
          <Card key={learner.id}>
            <CardHeader className="flex-row items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-semibold">
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
              <CardTitle className="min-w-0 flex-1 truncate">{learner.name}</CardTitle>
              <Button asChild variant="ghost" size="icon-sm">
                <Link
                  to={`/track-app/learners/${learner.id}`}
                  aria-label={m.learner_view_named({ name: learner.name })}
                >
                  <ArrowRight />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${status.className}`}
              >
                <status.icon className="size-3" /> {status.label}
              </span>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {learner.goals.length
                    ? m.learner_goals_completed({
                        completed,
                        total: learner.goals.length,
                      })
                    : m.learner_no_goals()}
                </span>
                <span className="font-medium">{overall}%</span>
              </div>
              <Progress
                value={overall}
                aria-label={m.learner_progress_label({
                  name: learner.name,
                  percent: overall,
                })}
              />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

import { ArrowRight, CheckCircle2, Clock3, MinusCircle, Target } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import * as m from '~/paraglide/messages.js'
import type { DashboardLearner, DashboardMembershipRole } from '../types'

const roleLabels: Record<DashboardMembershipRole, () => string> = {
  owner: m.learner_access_role_owner,
  parent: m.learner_access_role_parent,
  teacher: m.learner_access_role_teacher,
  viewer: m.learner_access_role_viewer,
}

function dateKey(value: Date | string): string {
  return new Date(value).toISOString().slice(0, 10)
}

function goalPercent(currentValue: number, targetValue: number): number {
  return Math.min(100, Math.round((currentValue / targetValue) * 100))
}

export function DashboardLearnerTable({
  learners,
  today,
}: {
  learners: DashboardLearner[]
  today: string
}) {
  if (learners.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <Target className="size-8 text-muted-foreground" />
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
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead>{m.dashboard_learner_column()}</TableHead>
            <TableHead className="hidden md:table-cell">{m.dashboard_group_column()}</TableHead>
            <TableHead>{m.dashboard_goals_column()}</TableHead>
            <TableHead className="min-w-44">{m.dashboard_progress_column()}</TableHead>
            <TableHead className="hidden lg:table-cell">{m.dashboard_status_column()}</TableHead>
            <TableHead className="w-16 text-right">{m.learner_actions()}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {learners.map((learner) => {
            const activeGoals = learner.goals.filter(
              (goal) => dateKey(goal.startDate) <= today && dateKey(goal.endDate) >= today,
            )
            const completedGoals = learner.goals.filter(
              (goal) => goal.currentValue >= goal.targetValue,
            ).length
            const needsUpdate = activeGoals.some(
              (goal) =>
                goal.currentValue < goal.targetValue &&
                !goal.entries.some((entry) => dateKey(entry.activityDate) === today),
            )
            const updatedToday = activeGoals.some((goal) =>
              goal.entries.some((entry) => dateKey(entry.activityDate) === today),
            )
            const progress = activeGoals.length
              ? Math.round(
                  activeGoals.reduce(
                    (sum, goal) => sum + goalPercent(goal.currentValue, goal.targetValue),
                    0,
                  ) / activeGoals.length,
                )
              : completedGoals > 0
                ? 100
                : 0
            const status = needsUpdate
              ? {
                  label: m.dashboard_status_needs_update(),
                  icon: Clock3,
                  className: 'text-amber-700 dark:text-amber-400',
                }
              : updatedToday
                ? {
                    label: m.dashboard_status_updated_today(),
                    icon: CheckCircle2,
                    className: 'text-emerald-700 dark:text-emerald-400',
                  }
                : {
                    label: m.dashboard_status_no_active_goal(),
                    icon: MinusCircle,
                    className: 'text-muted-foreground',
                  }

            return (
              <TableRow key={learner.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-semibold">
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
                      <p className="truncate font-medium">{learner.name}</p>
                      <p className="text-xs text-muted-foreground">{roleLabels[learner.role]()}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {learner.groupName ?? m.learner_group_ungrouped()}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {learner.goals.length
                      ? m.learner_goals_completed({
                          completed: completedGoals,
                          total: learner.goals.length,
                        })
                      : m.learner_no_goals()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex min-w-36 items-center gap-3">
                    <Progress
                      value={progress}
                      aria-label={m.learner_progress_label({
                        name: learner.name,
                        percent: progress,
                      })}
                    />
                    <span className="w-10 text-right text-xs font-medium tabular-nums">
                      {progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${status.className}`}
                  >
                    <status.icon className="size-3.5" /> {status.label}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link
                      to={`/track-app/learners/${learner.id}`}
                      aria-label={m.learner_view_named({ name: learner.name })}
                    >
                      <ArrowRight />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

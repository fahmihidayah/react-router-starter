import { ArrowRight, CalendarCheck2, CheckCircle2, Circle, Clock3 } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import * as m from '~/paraglide/messages.js'
import type { DashboardLearner, DashboardLearnerSchedule } from '../types'

export function DashboardTodaySchedule({
  learners,
  schedules,
  today,
}: {
  learners: DashboardLearner[]
  schedules: DashboardLearnerSchedule[]
  today: string
}) {
  const learnerById = new Map(learners.map((learner) => [learner.id, learner]))
  const scheduled = schedules
    .filter((schedule) => schedule.todos.length > 0)
    .flatMap((schedule) => {
      const learner = learnerById.get(schedule.learnerId)
      return learner ? [{ learner, todos: schedule.todos }] : []
    })
  const total = scheduled.reduce((sum, schedule) => sum + schedule.todos.length, 0)
  const completed = scheduled.reduce(
    (sum, schedule) => sum + schedule.todos.filter((todo) => todo.completed).length,
    0,
  )
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarCheck2 className="size-5 text-primary" />
              {m.dashboard_today_schedule()}
            </CardTitle>
            <CardDescription className="mt-1">
              {m.dashboard_today_schedule_description()}
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={`/track-app/schedule?view=today&date=${today}`}>
              {m.dashboard_view_schedule()} <ArrowRight />
            </Link>
          </Button>
        </div>
        {total > 0 ? (
          <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <Progress value={percent} />
            <span className="text-sm font-medium tabular-nums">
              {m.schedule_day_completion({ completed, total })} · {percent}%
            </span>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        {scheduled.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <CalendarCheck2 className="mx-auto size-9 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">{m.dashboard_no_schedule_today()}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {m.dashboard_no_schedule_today_description()}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {scheduled.map(({ learner, todos }) => {
              const learnerCompleted = todos.filter((todo) => todo.completed).length
              const plannedMinutes = todos.reduce(
                (sum, todo) => sum + todo.plannedDurationMinutes,
                0,
              )
              return (
                <div
                  key={learner.id}
                  className="grid gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)_auto] lg:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary">
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
                      <p className="truncate font-semibold">{learner.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.schedule_day_completion({
                          completed: learnerCompleted,
                          total: todos.length,
                        })}
                      </p>
                    </div>
                  </div>

                  <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {todos.map((todo) => (
                      <li
                        key={todo.id}
                        className="flex min-w-0 items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                        ) : (
                          <Circle className="size-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate">{todo.titleSnapshot}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between gap-3 lg:justify-end">
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock3 className="size-4" />
                      {m.schedule_minutes_count({ count: plannedMinutes })}
                    </span>
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link
                        to={`/track-app/schedule?learnerId=${learner.id}&view=today&date=${today}`}
                        aria-label={m.schedule_open_day({ date: today })}
                      >
                        <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

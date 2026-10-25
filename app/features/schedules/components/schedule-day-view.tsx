import { CalendarDays, Clock3, ListChecks, Repeat2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import type { TScheduleItem } from '~/db/schema'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import type { ScheduleSourceOption, ScheduleTodoWithProgress } from '../types'
import { AddScheduleTodoDialog } from './add-schedule-todo-dialog'
import { ClearScheduleDayDialog } from './clear-schedule-day-dialog'
import { SchedulePlanDialog } from './schedule-plan-dialog'
import {
  type ScheduleGoalReference,
  ScheduleTodoCard,
  type ScheduleTrackReference,
} from './schedule-todo-card'

function displayDay(date: string): string {
  return new Intl.DateTimeFormat(getLocale(), {
    dateStyle: 'full',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00.000Z`))
}

export function ScheduleDayView({
  learnerId,
  learnerName,
  selectedDate,
  today,
  timezone,
  planItems,
  todos,
  sources,
  goals,
  tracks,
  canManage,
  scheduleErrors,
  scheduleOperation,
  goalErrors,
  goalErrorTodoId,
  activityErrors,
  activityErrorTodoId,
}: {
  learnerId: string
  learnerName: string
  selectedDate: string
  today: string
  timezone: string
  planItems: TScheduleItem[]
  todos: ScheduleTodoWithProgress[]
  sources: ScheduleSourceOption[]
  goals: ScheduleGoalReference[]
  tracks: ScheduleTrackReference[]
  canManage: boolean
  scheduleErrors?: Record<string, string[] | undefined>
  scheduleOperation?: 'add-todo' | 'edit-plan'
  goalErrors?: Record<string, string[] | undefined>
  goalErrorTodoId?: string
  activityErrors?: Record<string, string[] | undefined>
  activityErrorTodoId?: string
}) {
  const completed = todos.filter((todo) => todo.completed).length
  const plannedMinutes = todos.reduce((sum, todo) => sum + todo.plannedDurationMinutes, 0)
  const actualMinutes = todos.reduce((sum, todo) => sum + todo.actualDurationMinutes, 0)
  const percent = todos.length === 0 ? 0 : Math.round((completed / todos.length) * 100)
  const isPast = selectedDate < today
  const goalById = new Map(goals.map((goal) => [goal.id, goal]))
  const trackById = new Map(tracks.map((track) => [track.id, track]))
  const hasIncomplete = todos.some((todo) => !todo.completed)

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="space-y-4">
        <Card className="gap-4">
          <CardHeader className="gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-primary">{displayDay(selectedDate)}</p>
                <CardTitle className="mt-1 text-xl">{m.schedule_today_progress()}</CardTitle>
              </div>
              {canManage && !isPast ? (
                <div className="flex flex-wrap gap-2">
                  {todos.length > 0 ? (
                    <AddScheduleTodoDialog
                      learnerId={learnerId}
                      learnerName={learnerName}
                      scheduledDate={selectedDate}
                      sources={sources}
                      errors={scheduleOperation === 'add-todo' ? scheduleErrors : undefined}
                    />
                  ) : null}
                  {planItems.length > 0 ? (
                    <SchedulePlanDialog
                      learnerId={learnerId}
                      planItems={planItems}
                      sources={sources}
                      startsOn={selectedDate}
                      timezone={timezone}
                      errors={scheduleOperation === 'edit-plan' ? scheduleErrors : undefined}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {m.schedule_progress_summary({
                  completed,
                  total: todos.length,
                  minutes: actualMinutes,
                })}
              </p>
              <span className="text-2xl font-bold tabular-nums">{percent}%</span>
            </div>
            <Progress value={percent} />
          </CardContent>
        </Card>

        {planItems.length === 0 ? (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Repeat2 />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{m.schedule_no_plan_title()}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {m.schedule_no_plan_description({ name: learnerName })}
                </p>
              </div>
              {canManage && !isPast ? (
                <SchedulePlanDialog
                  learnerId={learnerId}
                  planItems={planItems}
                  sources={sources}
                  startsOn={selectedDate}
                  timezone={timezone}
                  errors={scheduleOperation === 'edit-plan' ? scheduleErrors : undefined}
                />
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{m.schedule_what_today()}</h2>
            <p className="text-sm text-muted-foreground">
              {isPast ? m.schedule_past_read_only() : m.schedule_what_today_description()}
            </p>
          </div>
          {canManage && !isPast && hasIncomplete ? (
            <ClearScheduleDayDialog learnerId={learnerId} date={selectedDate} />
          ) : null}
        </div>

        {todos.length > 0 ? (
          <div className="space-y-3">
            {todos.map((todo, index) => (
              <ScheduleTodoCard
                key={todo.id}
                todo={todo}
                index={index}
                count={todos.length}
                learnerId={learnerId}
                selectedDate={selectedDate}
                today={today}
                canManage={canManage}
                goal={todo.goalId ? goalById.get(todo.goalId) : undefined}
                track={todo.trackId ? trackById.get(todo.trackId) : undefined}
                goalErrors={goalErrorTodoId === todo.id ? goalErrors : undefined}
                activityErrors={activityErrorTodoId === todo.id ? activityErrors : undefined}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed py-10 text-center">
            <CardContent>
              <CalendarDays className="mx-auto size-10 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">{m.schedule_empty_day_title()}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {m.schedule_empty_day_description()}
              </p>
              {canManage && !isPast ? (
                <div className="mt-4 flex justify-center">
                  <AddScheduleTodoDialog
                    learnerId={learnerId}
                    learnerName={learnerName}
                    scheduledDate={selectedDate}
                    sources={sources}
                    errors={scheduleOperation === 'add-todo' ? scheduleErrors : undefined}
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </section>

      <aside className="space-y-4 xl:sticky xl:top-6">
        <Card className="gap-4">
          <CardHeader>
            <CardTitle>{m.schedule_day_actions()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <ListChecks className="size-4" /> {m.schedule_todos_count({ count: todos.length })}
              </span>
              <span className="font-semibold">
                {completed}/{todos.length}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Clock3 className="size-4" /> {m.schedule_daily_total()}
              </span>
              <span className="font-semibold">
                {m.schedule_minutes_count({ count: plannedMinutes })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Repeat2 className="size-4" /> {m.schedule_repeats_daily()}
              </span>
              <span className="font-semibold">{planItems.length}</span>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}

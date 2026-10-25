import { ArrowLeft, ArrowRight, CalendarDays, Plus } from 'lucide-react'
import { Form, Link, useActionData, useLoaderData, useSearchParams } from 'react-router'
import { Button, buttonVariants } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { createActivityAction } from '~/features/activities/actions'
import * as activityService from '~/features/activities/services'
import { saveProgressEntryAction } from '~/features/goals/actions/goal-actions'
import * as goalService from '~/features/goals/services'
import * as learnerService from '~/features/learners/services'
import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import {
  addScheduleTodoAction,
  clearScheduleDayAction,
  moveScheduleTodoAction,
  removeScheduleTodoAction,
  saveSchedulePlanAction,
} from '~/features/schedules/actions'
import {
  ScheduleDayView,
  ScheduleLearnerPicker,
  ScheduleMonthView,
  ScheduleWeekView,
} from '~/features/schedules/components'
import * as scheduleService from '~/features/schedules/services'
import {
  addDays,
  dateKeyInTimeZone,
  isDateKey,
  monthRange,
  weekRange,
} from '~/features/schedules/utils/date-range'
import { userContext } from '~/features/users/contexts'
import { cn } from '~/lib/utils'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import type { Route } from './+types/schedule'

export const middleware: Route.MiddlewareFunction[] = [
  enforceRoutePermissions({
    intents: {
      addScheduleTodo: PERMISSION_KEYS.SCHEDULES_CREATE,
      clearScheduleDay: PERMISSION_KEYS.SCHEDULES_DELETE,
      createActivity: PERMISSION_KEYS.ACTIVITIES_CREATE,
      moveScheduleTodo: PERMISSION_KEYS.SCHEDULES_UPDATE,
      removeScheduleTodo: PERMISSION_KEYS.SCHEDULES_DELETE,
      saveProgressEntry: PERMISSION_KEYS.GOALS_UPDATE,
      saveSchedulePlan: PERMISSION_KEYS.SCHEDULES_UPDATE,
    },
    loader: {
      allOf: [
        PERMISSION_KEYS.SCHEDULES_READ,
        PERMISSION_KEYS.LEARNERS_READ,
        PERMISSION_KEYS.GOALS_READ,
        PERMISSION_KEYS.ACTIVITIES_READ,
      ],
    },
  }),
]

const TIMEZONE = 'Asia/Jakarta'
const scheduleViews = ['today', 'week', 'month'] as const
type ScheduleView = (typeof scheduleViews)[number]

export function meta() {
  return [{ title: m.schedule_meta_title() }]
}

function isScheduleView(value: string | null): value is ScheduleView {
  return scheduleViews.includes(value as ScheduleView)
}

function rangeForView(date: string, view: ScheduleView): { start: string; end: string } {
  if (view === 'week') return weekRange(date)
  if (view === 'month') return monthRange(date)
  return { start: date, end: date }
}

function shiftDate(date: string, view: ScheduleView, amount: number): string {
  if (view === 'week') return addDays(date, amount * 7)
  if (view === 'today') return addDays(date, amount)
  const value = new Date(`${date.slice(0, 7)}-01T00:00:00.000Z`)
  value.setUTCMonth(value.getUTCMonth() + amount)
  return value.toISOString().slice(0, 10)
}

function formatRangeDate(date: string): string {
  return new Intl.DateTimeFormat(getLocale(), {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00.000Z`))
}

function scheduleUrl(learnerId: string, date: string, view: ScheduleView): string {
  const params = new URLSearchParams({ learnerId, date, view })
  return `/track-app/schedule?${params.toString()}`
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const authSession = context.get(userContext)
  if (!authSession.user) throw new Response(m.schedule_error_unauthorized(), { status: 401 })

  const organized = await learnerService.findOrganizedForUser(authSession.user.id)
  const groupNameById = new Map(organized.groups.map((group) => [group.id, group.name]))
  const learners = [...organized.groups.flatMap((group) => group.learners), ...organized.ungrouped]
    .map((learner) => ({
      ...learner,
      groupName: learner.groupId ? (groupNameById.get(learner.groupId) ?? null) : null,
    }))
    .sort((first, second) => first.name.localeCompare(second.name))
  const url = new URL(request.url)
  const today = dateKeyInTimeZone(new Date(), TIMEZONE)
  const requestedDate = url.searchParams.get('date')
  const selectedDate = requestedDate && isDateKey(requestedDate) ? requestedDate : today
  const requestedView = url.searchParams.get('view')
  const view = isScheduleView(requestedView) ? requestedView : 'today'
  const requestedLearnerId = url.searchParams.get('learnerId')
  const selectedLearner =
    learners.find((learner) => learner.id === requestedLearnerId) ?? learners.at(0) ?? null

  if (!selectedLearner) {
    return {
      learners,
      selectedLearner: null,
      selectedDate,
      today,
      timezone: TIMEZONE,
      view,
      range: rangeForView(selectedDate, view),
      schedule: null,
      goals: [],
      tracks: [],
      sources: [],
    }
  }

  const range = rangeForView(selectedDate, view)
  const [schedule, goals, tracks] = await Promise.all([
    scheduleService.findRangeForUser(
      selectedLearner.id,
      authSession.user.id,
      range.start,
      range.end,
    ),
    goalService.findWithProgress(selectedLearner.id),
    activityService.findAllTracksForLearner(selectedLearner.id),
  ])
  if (!schedule) throw new Response(m.schedule_error_learner_not_found(), { status: 404 })

  const sources = [
    ...goals
      .filter(
        (goal) =>
          goal.startDate.toISOString().slice(0, 10) <= selectedDate &&
          goal.endDate.toISOString().slice(0, 10) >= selectedDate,
      )
      .map((goal) => ({
        id: goal.id,
        sourceType: 'goal' as const,
        title: goal.title,
        detail: m.schedule_goal_progress({
          percent: Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)),
        }),
      })),
    ...tracks
      .filter((track) => !track.archivedAt)
      .map((track) => ({
        id: track.id,
        sourceType: 'activity_track' as const,
        title: track.name,
        detail: m.schedule_activity(),
      })),
  ]

  return {
    learners,
    selectedLearner,
    selectedDate,
    today,
    timezone: TIMEZONE,
    view,
    range,
    schedule,
    goals: goals.map(({ id, title, unit, targetValue, currentValue }) => ({
      id,
      title,
      unit,
      targetValue,
      currentValue,
    })),
    tracks: tracks.map(({ id, name }) => ({ id, name })),
    sources,
  }
}

export async function action(args: Route.ActionArgs) {
  const formData = await args.request.clone().formData()
  const url = new URL(args.request.url)
  const intent = formData.get('intent')
  const learnerId = String(formData.get('learnerId') ?? url.searchParams.get('learnerId') ?? '')
  const dateValue = String(formData.get('date') ?? url.searchParams.get('date') ?? '')
  const date = isDateKey(dateValue) ? dateValue : dateKeyInTimeZone(new Date(), TIMEZONE)
  const today = dateKeyInTimeZone(new Date(), TIMEZONE)
  if (!learnerId) throw new Response(m.schedule_error_learner_required(), { status: 400 })

  if (intent === 'saveSchedulePlan') return saveSchedulePlanAction(args, learnerId, date)
  if (intent === 'addScheduleTodo') return addScheduleTodoAction(args, learnerId)
  if (intent === 'clearScheduleDay') {
    return clearScheduleDayAction(args, learnerId, date, today)
  }
  if (intent === 'removeScheduleTodo' || intent === 'moveScheduleTodo') {
    const todoId = formData.get('todoId')
    if (typeof todoId !== 'string') {
      throw new Response(m.schedule_error_todo_required(), { status: 400 })
    }
    return intent === 'removeScheduleTodo'
      ? removeScheduleTodoAction(args, learnerId, todoId, date, today)
      : moveScheduleTodoAction(args, learnerId, todoId, date, today)
  }

  const redirectTo = scheduleUrl(learnerId, date, 'today')
  const scheduleTodoId = formData.get('scheduleTodoId')
  if (intent === 'saveProgressEntry') {
    const goalId = formData.get('goalId')
    if (typeof goalId !== 'string') {
      throw new Response(m.schedule_error_source_invalid(), { status: 400 })
    }
    const result = await saveProgressEntryAction(args, learnerId, goalId, redirectTo)
    return result instanceof Response
      ? result
      : { ...result, scheduleTodoId: String(scheduleTodoId ?? '') }
  }
  if (intent === 'createActivity') {
    const result = await createActivityAction(args, learnerId, redirectTo)
    return result instanceof Response
      ? result
      : { ...result, scheduleTodoId: String(scheduleTodoId ?? '') }
  }
  throw new Response(m.schedule_error_action_invalid(), { status: 400 })
}

export default function SchedulePage() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const [searchParams] = useSearchParams()
  const actionScope = actionData && 'scope' in actionData ? actionData.scope : undefined
  const scheduleOperation =
    actionData &&
    actionScope === 'schedule' &&
    'operation' in actionData &&
    (actionData.operation === 'add-todo' || actionData.operation === 'edit-plan')
      ? actionData.operation
      : undefined
  const errors = actionData && 'errors' in actionData ? actionData.errors : undefined
  const errorTodoId =
    actionData && 'scheduleTodoId' in actionData ? actionData.scheduleTodoId : undefined
  const previousDate = shiftDate(data.selectedDate, data.view, -1)
  const nextDate = shiftDate(data.selectedDate, data.view, 1)
  const paramsForView = (view: ScheduleView) => {
    const next = new URLSearchParams(searchParams)
    next.set('view', view)
    next.set('date', data.selectedDate)
    return `/track-app/schedule?${next.toString()}`
  }

  if (!data.selectedLearner || !data.schedule) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarDays className="size-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">{m.schedule_no_learners_title()}</h1>
          <p className="mt-2 text-muted-foreground">{m.schedule_no_learners_description()}</p>
          <Button asChild className="mt-5">
            <Link to="/track-app/learners/new">
              <Plus /> {m.schedule_manage_learners()}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const viewLabel =
    data.view === 'today'
      ? formatRangeDate(data.selectedDate)
      : m.schedule_week_title({
          start: formatRangeDate(data.range.start),
          end: formatRangeDate(data.range.end),
        })

  return (
    <div className="flex-1 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-[96rem] space-y-6">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary">
              {m.schedule_eyebrow()}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              {m.schedule_title({ name: data.selectedLearner.name })}
            </h1>
            <p className="mt-2 text-muted-foreground">{m.schedule_description()}</p>
          </div>
          <ScheduleLearnerPicker
            learners={data.learners}
            selectedLearnerId={data.selectedLearner.id}
          />
        </header>

        <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <nav className="flex rounded-lg bg-muted p-1">
            {scheduleViews.map((view) => (
              <Link
                key={view}
                to={paramsForView(view)}
                className={cn(
                  buttonVariants({ variant: data.view === view ? 'default' : 'ghost', size: 'sm' }),
                  'flex-1',
                )}
              >
                {view === 'today'
                  ? m.schedule_today()
                  : view === 'week'
                    ? m.schedule_week()
                    : m.schedule_month()}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-2 lg:justify-end">
            <Button asChild variant="ghost" size="icon-sm">
              <Link
                to={scheduleUrl(data.selectedLearner.id, previousDate, data.view)}
                aria-label={m.schedule_open_day({ date: previousDate })}
              >
                <ArrowLeft />
              </Link>
            </Button>
            <span className="min-w-32 text-center text-sm font-semibold">{viewLabel}</span>
            <Button asChild variant="ghost" size="icon-sm">
              <Link
                to={scheduleUrl(data.selectedLearner.id, nextDate, data.view)}
                aria-label={m.schedule_open_day({ date: nextDate })}
              >
                <ArrowRight />
              </Link>
            </Button>
            <Form method="get" className="flex items-center gap-2">
              <input type="hidden" name="learnerId" value={data.selectedLearner.id} />
              <input type="hidden" name="view" value={data.view} />
              <Input
                key={data.selectedDate}
                className="w-36"
                type="date"
                name="date"
                defaultValue={data.selectedDate}
                aria-label={m.schedule_open_day({ date: data.selectedDate })}
              />
              <Button type="submit" size="sm" variant="outline">
                {m.schedule_open_date()}
              </Button>
            </Form>
          </div>
        </div>

        {data.view === 'today' ? (
          <ScheduleDayView
            key={data.selectedLearner.id}
            learnerId={data.selectedLearner.id}
            learnerName={data.selectedLearner.name}
            selectedDate={data.selectedDate}
            today={data.today}
            timezone={data.timezone}
            planItems={data.schedule.planItems}
            todos={data.schedule.todos}
            sources={data.sources}
            goals={data.goals}
            tracks={data.tracks}
            canManage={data.selectedLearner.role !== 'viewer'}
            scheduleErrors={actionScope === 'schedule' ? errors : undefined}
            scheduleOperation={scheduleOperation}
            goalErrors={actionScope === 'goal' ? errors : undefined}
            goalErrorTodoId={actionScope === 'goal' ? errorTodoId : undefined}
            activityErrors={actionScope === 'activity' ? errors : undefined}
            activityErrorTodoId={actionScope === 'activity' ? errorTodoId : undefined}
          />
        ) : data.view === 'week' ? (
          <ScheduleWeekView
            learnerId={data.selectedLearner.id}
            start={data.range.start}
            end={data.range.end}
            today={data.today}
            todos={data.schedule.todos}
          />
        ) : (
          <ScheduleMonthView
            learnerId={data.selectedLearner.id}
            start={data.range.start}
            end={data.range.end}
            today={data.today}
            todos={data.schedule.todos}
          />
        )}
      </div>
    </div>
  )
}

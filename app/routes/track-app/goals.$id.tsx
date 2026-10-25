import { ArrowLeft, CalendarDays, Clock3, Hash, Trash2, UserRound } from 'lucide-react'
import { Form, Link, useActionData, useLoaderData } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import {
  deleteProgressEntryAction,
  saveProgressEntryAction,
} from '~/features/goals/actions/goal-actions'
import { GoalPomodoroSession } from '~/features/goals/components/goal-pomodoro-session'
import { GoalProgressForm } from '~/features/goals/components/goal-progress-form'
import * as goalService from '~/features/goals/services'
import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import { userContext } from '~/features/users/contexts'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import type { Route } from './+types/goals.$id'

export const middleware: Route.MiddlewareFunction[] = [
  enforceRoutePermissions({
    intents: {
      deleteProgressEntry: PERMISSION_KEYS.GOALS_UPDATE,
      saveProgressEntry: PERMISSION_KEYS.GOALS_UPDATE,
    },
    loader: PERMISSION_KEYS.GOALS_READ,
  }),
]

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? `${data.goal.title} - Track App` : 'Goal - Track App' }]
}

function currentUserId({ context }: Route.LoaderArgs | Route.ActionArgs) {
  const authSession = context.get(userContext)
  if (!authSession.user) throw new Response('Unauthorized', { status: 401 })
  return authSession.user.id
}

export async function loader(args: Route.LoaderArgs) {
  const goalId = args.params.id
  if (!goalId) throw new Response('Goal ID is required', { status: 400 })

  const detail = await goalService.findDetailForUser(goalId, currentUserId(args))
  if (!detail) throw new Response('Goal not found', { status: 404 })
  return detail
}

export async function action(args: Route.ActionArgs) {
  const goalId = args.params.id
  if (!goalId) throw new Response('Goal ID is required', { status: 400 })

  const detail = await goalService.findDetailForUser(goalId, currentUserId(args))
  if (!detail) throw new Response('Goal not found', { status: 404 })
  if (!detail.canManage) throw new Response('Forbidden', { status: 403 })

  const formData = await args.request.clone().formData()
  const intent = formData.get('intent')
  const redirectTo = `/track-app/goals/${goalId}`

  if (intent === 'saveProgressEntry') {
    return saveProgressEntryAction(args, detail.goal.learnerId, goalId, redirectTo)
  }
  if (intent === 'deleteProgressEntry') {
    const entryId = formData.get('entryId')
    if (typeof entryId !== 'string') {
      throw new Response('Progress entry ID is required', { status: 400 })
    }
    return deleteProgressEntryAction(args, detail.goal.learnerId, goalId, entryId, redirectTo)
  }

  throw new Response('Invalid action', { status: 400 })
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat(getLocale(), {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value))
}

export default function GoalDetailPage() {
  const { goal, learner, canManage } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const errors =
    actionData && 'scope' in actionData && actionData.scope === 'goal' && 'errors' in actionData
      ? actionData.errors
      : undefined
  const entryMode =
    actionData &&
    'entryMode' in actionData &&
    (actionData.entryMode === 'manual' || actionData.entryMode === 'pomodoro')
      ? actionData.entryMode
      : undefined
  const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))

  return (
    <div className="flex-1 p-6">
      <div className="w-full space-y-6">
        <Button asChild variant="ghost" className="-ml-3">
          <Link to={`/track-app/learners/${learner.id}?tab=goals`}>
            <ArrowLeft /> {m.goal_details_back({ name: learner.name })}
          </Link>
        </Button>

        <div>
          <p className="text-sm text-muted-foreground">
            {m.goal_details_for_learner({ name: learner.name })}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{goal.title}</h1>
          {goal.description ? (
            <p className="mt-2 max-w-3xl text-muted-foreground">{goal.description}</p>
          ) : null}
        </div>

        <Card>
          <CardContent className="grid gap-5 p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium">
                  {m.goal_current_of_target({
                    current: goal.currentValue,
                    target: goal.targetValue,
                    unit: goal.unit,
                  })}
                </p>
                <p className="text-sm font-medium">{percent}%</p>
              </div>
              <Progress
                value={percent}
                aria-label={m.goal_progress_label({ title: goal.title, percent })}
              />
            </div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />
              {formatDate(goal.startDate)} – {formatDate(goal.endDate)}
            </p>
          </CardContent>
        </Card>

        {canManage ? (
          <Card>
            <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <CardTitle>{m.goal_details_record_progress()}</CardTitle>
                <CardDescription>{m.goal_details_record_progress_description()}</CardDescription>
              </div>
              <GoalPomodoroSession
                goalId={goal.id}
                goalTitle={goal.title}
                unit={goal.unit}
                errors={entryMode === 'pomodoro' ? errors : undefined}
              />
            </CardHeader>
            <CardContent>
              <GoalProgressForm
                goalId={goal.id}
                unit={goal.unit}
                errors={entryMode !== 'pomodoro' ? errors : undefined}
              />
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{m.goal_details_progress_history()}</CardTitle>
            <CardDescription>{m.goal_details_progress_history_description()}</CardDescription>
          </CardHeader>
          <CardContent>
            {goal.entries.length === 0 ? (
              <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                {m.goal_no_entries()}
              </p>
            ) : (
              <div className="divide-y rounded-lg border">
                {goal.entries.map((entry) => (
                  <div key={entry.id} className="flex gap-4 p-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <p className="flex items-center gap-1.5 font-medium">
                          <Hash className="size-4 text-muted-foreground" />
                          {entry.value} {goal.unit}
                        </p>
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <CalendarDays className="size-4" />
                          {formatDate(entry.activityDate)}
                        </p>
                        {entry.durationMinutes ? (
                          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock3 className="size-4" />
                            {m.activity_minutes({ count: entry.durationMinutes })}
                          </p>
                        ) : null}
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <UserRound className="size-4" />
                          {m.activity_recorded_by({ name: entry.recordedByName })}
                        </p>
                      </div>
                      {entry.note ? (
                        <p className="whitespace-pre-wrap text-sm">{entry.note}</p>
                      ) : null}
                    </div>
                    {canManage ? (
                      <Form method="post">
                        <input type="hidden" name="intent" value="deleteProgressEntry" />
                        <input type="hidden" name="entryId" value={entry.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={m.goal_delete_progress_entry()}
                        >
                          <Trash2 className="text-muted-foreground" />
                        </Button>
                      </Form>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

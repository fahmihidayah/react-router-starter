import { Archive, ArrowLeft, CalendarDays, Clock3, ListChecks, Pencil } from 'lucide-react'
import { Form, Link, useActionData, useLoaderData } from 'react-router'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
  archiveTrackAction,
  createActivityAction,
  deleteActivityAction,
  renameTrackAction,
} from '~/features/activities/actions'
import {
  ActivityRecordList,
  CreateActivityDialog,
  PomodoroSession,
  RenameTrackDialog,
} from '~/features/activities/components'
import * as activityService from '~/features/activities/services'
import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import { userContext } from '~/features/users/contexts'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import type { Route } from './+types/tracks.$id'

export const middleware: Route.MiddlewareFunction[] = [
  enforceRoutePermissions({
    intents: {
      archiveTrack: PERMISSION_KEYS.ACTIVITIES_UPDATE,
      createActivity: PERMISSION_KEYS.ACTIVITIES_CREATE,
      deleteActivity: PERMISSION_KEYS.ACTIVITIES_DELETE,
      renameTrack: PERMISSION_KEYS.ACTIVITIES_UPDATE,
    },
    loader: PERMISSION_KEYS.ACTIVITIES_READ,
  }),
]

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? `${data.track.name} - Track App` : 'Topic - Track App' }]
}

function currentUserId({ context }: Route.LoaderArgs | Route.ActionArgs) {
  const authSession = context.get(userContext)
  if (!authSession.user) throw new Response('Unauthorized', { status: 401 })
  return authSession.user.id
}

function todayDateKey() {
  const now = new Date()
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
}

export async function loader(args: Route.LoaderArgs) {
  const trackId = args.params.id
  if (!trackId) throw new Response('Topic ID is required', { status: 400 })

  const detail = await activityService.findTrackDetailForUser(trackId, currentUserId(args))
  if (!detail) throw new Response('Topic not found', { status: 404 })
  return { ...detail, today: todayDateKey() }
}

export async function action(args: Route.ActionArgs) {
  const trackId = args.params.id
  if (!trackId) throw new Response('Topic ID is required', { status: 400 })

  const detail = await activityService.findTrackDetailForUser(trackId, currentUserId(args))
  if (!detail) throw new Response('Topic not found', { status: 404 })
  if (!detail.canManage) throw new Response('Forbidden', { status: 403 })

  const formData = await args.request.clone().formData()
  const intent = formData.get('intent')
  const redirectTo = `/track-app/tracks/${trackId}`

  if (intent === 'createActivity') {
    if (detail.track.archivedAt) throw new Response('Topic is archived', { status: 409 })
    if (formData.get('trackId') !== trackId) {
      throw new Response('Topic does not match this page', { status: 400 })
    }
    return createActivityAction(args, detail.learner.id, redirectTo)
  }
  if (intent === 'deleteActivity') {
    const activityId = formData.get('activityId')
    if (typeof activityId !== 'string') {
      throw new Response('Activity ID is required', { status: 400 })
    }
    if (!detail.activities.some((activity) => activity.id === activityId)) {
      throw new Response('Activity not found', { status: 404 })
    }
    return deleteActivityAction(args, detail.learner.id, activityId, redirectTo)
  }
  if (intent === 'renameTrack') {
    return renameTrackAction(args, detail.learner.id, trackId, redirectTo)
  }
  if (intent === 'archiveTrack') {
    return archiveTrackAction(args, detail.learner.id, trackId)
  }

  throw new Response('Invalid action', { status: 400 })
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat(getLocale(), {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value))
}

export default function TrackDetailPage() {
  const { track, learner, activities, canManage, today } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const operation = actionData && 'operation' in actionData ? actionData.operation : undefined
  const errors = actionData && 'errors' in actionData ? actionData.errors : undefined
  const entryMode = actionData && 'entryMode' in actionData ? actionData.entryMode : undefined
  const totalDuration = activities.reduce(
    (total, activity) => total + (activity.durationMinutes ?? 0),
    0,
  )
  const latest = activities[0]?.activityDate
  const archived = Boolean(track.archivedAt)

  return (
    <div className="flex-1 p-4 sm:p-6">
      <div className="w-full space-y-6">
        <Button asChild variant="ghost" className="-ml-3">
          <Link to={`/track-app/learners/${learner.id}?tab=activities`}>
            <ArrowLeft /> {m.activity_details_back({ name: learner.name })}
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              {m.activity_details_for_learner({ name: learner.name })}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="break-words text-3xl font-bold tracking-tight">{track.name}</h1>
              {archived ? (
                <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                  {m.activity_archived()}
                </span>
              ) : null}
            </div>
          </div>
          {canManage ? (
            <div className="flex flex-wrap gap-2">
              {!archived ? (
                <>
                  <PomodoroSession
                    trackId={track.id}
                    topicName={track.name}
                    today={today}
                    errors={
                      operation === 'create-activity' && entryMode === 'pomodoro'
                        ? errors
                        : undefined
                    }
                  />
                  <CreateActivityDialog
                    trackId={track.id}
                    topicName={track.name}
                    today={today}
                    errors={
                      operation === 'create-activity' && entryMode !== 'pomodoro'
                        ? errors
                        : undefined
                    }
                    defaultOpen={
                      operation === 'create-activity' && entryMode !== 'pomodoro' && Boolean(errors)
                    }
                  />
                </>
              ) : null}
              <RenameTrackDialog
                track={track}
                errors={operation === 'rename-track' ? errors : undefined}
                trigger={
                  <Button type="button" variant="outline" size="sm">
                    <Pencil /> {m.activity_rename_track()}
                  </Button>
                }
              />
              {!archived ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Archive /> {m.activity_archive_track()}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {m.activity_topic_archive_title({ topic: track.name })}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {m.activity_topic_archive_description()}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{m.learner_cancel()}</AlertDialogCancel>
                      <Form method="post">
                        <input type="hidden" name="intent" value="archiveTrack" />
                        <AlertDialogAction asChild>
                          <Button type="submit" variant="destructive">
                            {m.activity_topic_archive_action()}
                          </Button>
                        </AlertDialogAction>
                      </Form>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
            </div>
          ) : null}
        </div>

        {archived ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            {m.activity_archived_description()}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <ListChecks className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{m.activity_details_total_logs()}</p>
                <p className="text-2xl font-semibold">{activities.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <Clock3 className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {m.activity_details_total_duration()}
                </p>
                <p className="text-2xl font-semibold">
                  {m.activity_minutes({ count: totalDuration })}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <CalendarDays className="size-5 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{m.activity_details_latest()}</p>
                <p className="truncate font-semibold">
                  {latest ? formatDate(latest) : m.activity_details_no_latest()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{m.activity_details_history()}</CardTitle>
            <CardDescription>{m.activity_details_history_description()}</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityRecordList activities={activities} canManage={canManage} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

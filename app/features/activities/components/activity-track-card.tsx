import { Archive, BookOpen, ExternalLink, Pencil } from 'lucide-react'
import { Form, Link } from 'react-router'
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
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { TActivityTrack } from '~/db/schema'
import * as m from '~/paraglide/messages.js'
import type { LearningActivityWithDetails } from '../types'
import { ActivityRecordList } from './activity-record-list'
import { CreateActivityDialog } from './create-activity-dialog'
import { PomodoroSession } from './pomodoro-session'
import { RenameTrackDialog } from './rename-track-dialog'

export function ActivityTrackCard({
  track,
  activities,
  today,
  canManage,
  createErrors,
  pomodoroErrors,
  renameErrors,
}: {
  track: TActivityTrack
  activities: LearningActivityWithDetails[]
  today: string
  canManage: boolean
  createErrors?: Record<string, string[] | undefined>
  pomodoroErrors?: Record<string, string[] | undefined>
  renameErrors?: Record<string, string[] | undefined>
}) {
  return (
    <Card className="min-w-0 gap-4 py-4">
      <CardHeader className="grid-cols-[minmax(0,1fr)_auto] px-4">
        <div className="min-w-0 space-y-1">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-4 shrink-0" />
            <span className="truncate">{track.name}</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {m.activity_topic_entries({ count: activities.length })}
          </p>
        </div>
        {canManage ? (
          <div className="flex items-center gap-1">
            <RenameTrackDialog
              track={track}
              errors={renameErrors}
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={m.activity_rename_track()}
                >
                  <Pencil />
                </Button>
              }
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={m.activity_archive_track()}
                >
                  <Archive />
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
                    <input type="hidden" name="trackId" value={track.id} />
                    <AlertDialogAction asChild>
                      <Button type="submit" variant="destructive">
                        {m.activity_topic_archive_action()}
                      </Button>
                    </AlertDialogAction>
                  </Form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 px-4">
        <ActivityRecordList activities={activities} canManage={canManage} limit={3} />
        <div className="mt-auto flex flex-wrap gap-2">
          {canManage ? (
            <>
              <PomodoroSession
                trackId={track.id}
                topicName={track.name}
                today={today}
                errors={pomodoroErrors}
              />
              <CreateActivityDialog
                trackId={track.id}
                topicName={track.name}
                today={today}
                errors={createErrors}
                defaultOpen={Boolean(createErrors)}
              />
            </>
          ) : null}
          <Button asChild type="button" size="sm" variant="outline">
            <Link to={`/track-app/tracks/${track.id}`}>
              <ExternalLink /> {m.activity_topic_view_history()}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

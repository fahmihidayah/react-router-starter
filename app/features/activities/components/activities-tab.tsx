import { BookOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import type { TActivityTrack } from '~/db/schema'
import * as m from '~/paraglide/messages.js'
import type { LearningActivityWithDetails } from '../types'
import { ActivityRecordList } from './activity-record-list'
import { ActivityTrackCard } from './activity-track-card'
import { groupActivitiesByTrack } from './activity-track-groups'
import { CreateTrackDialog } from './create-track-dialog'

export function ActivitiesTab({
  activities,
  tracks,
  today,
  errors,
  operation,
  errorTrackId,
  activityEntryMode,
  canManage = true,
}: {
  activities: LearningActivityWithDetails[]
  tracks: TActivityTrack[]
  today: string
  errors?: Record<string, string[] | undefined>
  operation?: string
  errorTrackId?: string
  activityEntryMode?: 'manual' | 'pomodoro'
  canManage?: boolean
}) {
  const { groups, previous } = groupActivitiesByTrack(tracks, activities)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{m.activity_learning_title()}</h2>
          <p className="text-sm text-muted-foreground">{m.activity_learning_description()}</p>
        </div>
        {canManage ? (
          <CreateTrackDialog errors={operation === 'create-track' ? errors : undefined} />
        ) : null}
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <BookOpen className="mx-auto mb-3 size-7 text-muted-foreground" />
          <p className="font-medium">{m.activity_topic_empty_title()}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {m.activity_topic_empty_description()}
          </p>
        </div>
      ) : (
        <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map(({ track, activities: trackActivities }) => (
            <ActivityTrackCard
              key={track.id}
              track={track}
              activities={trackActivities}
              today={today}
              canManage={canManage}
              createErrors={
                operation === 'create-activity' &&
                errorTrackId === track.id &&
                activityEntryMode !== 'pomodoro'
                  ? errors
                  : undefined
              }
              pomodoroErrors={
                operation === 'create-activity' &&
                errorTrackId === track.id &&
                activityEntryMode === 'pomodoro'
                  ? errors
                  : undefined
              }
              renameErrors={
                operation === 'rename-track' && errorTrackId === track.id ? errors : undefined
              }
            />
          ))}
        </div>
      )}

      {previous.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{m.activity_previous_title()}</CardTitle>
            <CardDescription>{m.activity_previous_description()}</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityRecordList activities={previous} canManage={canManage} showTopic />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

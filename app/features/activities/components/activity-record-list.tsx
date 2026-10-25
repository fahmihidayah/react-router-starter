import { CalendarDays, Clock3, Hash, Trash2, UserRound } from 'lucide-react'
import { Form, Link } from 'react-router'
import { Button } from '~/components/ui/button'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import type { LearningActivityWithDetails } from '../types'

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat(getLocale(), {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value))
}

export function ActivityRecordList({
  activities,
  canManage,
  limit,
  showTopic = false,
}: {
  activities: LearningActivityWithDetails[]
  canManage: boolean
  limit?: number
  showTopic?: boolean
}) {
  const visible = typeof limit === 'number' ? activities.slice(0, limit) : activities

  if (visible.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {m.activity_topic_no_records()}
      </p>
    )
  }

  return (
    <div className="divide-y rounded-lg border">
      {visible.map((activity) => (
        <div key={activity.id} className="flex gap-3 p-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium break-words">{activity.title}</p>
              {showTopic && activity.trackId && activity.trackName ? (
                <Link
                  to={`/track-app/tracks/${activity.trackId}`}
                  className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {activity.trackName}
                </Link>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                {formatDate(activity.activityDate)}
              </span>
              {activity.durationMinutes ? (
                <span className="flex items-center gap-1">
                  <Clock3 className="size-3.5" />
                  {m.activity_minutes({ count: activity.durationMinutes })}
                </span>
              ) : null}
              {activity.value && activity.unit ? (
                <span className="flex items-center gap-1">
                  <Hash className="size-3.5" />
                  {m.activity_measurement({ value: activity.value, unit: activity.unit })}
                </span>
              ) : null}
              <span className="flex items-center gap-1">
                <UserRound className="size-3.5" />
                {m.activity_recorded_by({ name: activity.recordedByName })}
              </span>
            </div>
            {activity.note ? (
              <p className="whitespace-pre-wrap break-words text-sm">{activity.note}</p>
            ) : null}
          </div>
          {canManage ? (
            <Form method="post">
              <input type="hidden" name="intent" value="deleteActivity" />
              <input type="hidden" name="activityId" value={activity.id} />
              <Button type="submit" size="icon-sm" variant="ghost" aria-label={m.activity_delete()}>
                <Trash2 className="text-muted-foreground" />
              </Button>
            </Form>
          ) : null}
        </div>
      ))}
    </div>
  )
}

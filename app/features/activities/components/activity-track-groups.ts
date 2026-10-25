import type { TActivityTrack } from '~/db/schema'
import type { LearningActivityWithDetails } from '../types'

export function groupActivitiesByTrack(
  tracks: TActivityTrack[],
  activities: LearningActivityWithDetails[],
) {
  const activeTrackIds = new Set(tracks.map((track) => track.id))
  return {
    groups: tracks.map((track) => ({
      track,
      activities: activities.filter((activity) => activity.trackId === track.id),
    })),
    previous: activities.filter(
      (activity) => activity.trackId === null || !activeTrackIds.has(activity.trackId),
    ),
  }
}

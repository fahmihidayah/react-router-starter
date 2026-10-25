import type { TActivityTrack, TLearner, TLearningRecord } from '~/db/schema'

export type LearningRecordWithDetails = TLearningRecord & {
  recordedByName: string
  trackName: string | null
}

export type LearningActivityWithDetails = LearningRecordWithDetails

export type LearnerActivities = {
  activities: LearningActivityWithDetails[]
  tracks: TActivityTrack[]
}

export type ActivityTrackDetail = {
  track: TActivityTrack
  learner: TLearner
  activities: LearningActivityWithDetails[]
  canManage: boolean
}

export type LearnerWithActivityTracks = TLearner & {
  tracks: TActivityTrack[]
}

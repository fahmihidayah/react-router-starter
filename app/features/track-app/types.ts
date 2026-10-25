import type { TActivityTrack, TLearnerGroup, TLearnerMember } from '~/db/schema'
import type { LearningRecordWithDetails } from '~/features/activities/types'
import type { GoalWithProgress } from '~/features/goals/types'
import type { LearnerListItem } from '~/features/learners/types'
import type { ScheduleTodoWithProgress } from '~/features/schedules/types'

export type DashboardLearner = LearnerListItem & {
  groupName: string | null
  goals: GoalWithProgress[]
  tracks?: TActivityTrack[]
}

export type DashboardGroup = Pick<TLearnerGroup, 'id' | 'name'> & {
  learners: DashboardLearner[]
}

export type DashboardGoalItem = {
  learner: DashboardLearner
  goal: GoalWithProgress
}

export type DashboardLearnerSchedule = {
  learnerId: string
  todos: ScheduleTodoWithProgress[]
}

export type DashboardWeeklyPoint = {
  date: string
  activityCount: number
  goalUpdateCount: number
  activeLearnerCount: number
}

export type DashboardMembershipRole = TLearnerMember['role']

export type DashboardReport = {
  recentRecords: LearningRecordWithDetails[]
  weekly: DashboardWeeklyPoint[]
}

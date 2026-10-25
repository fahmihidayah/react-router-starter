import type { TLearner, TLearnerGroup, TLearnerMember, TUser } from '~/db/schema'
import type { GoalWithProgress } from '~/features/goals/types'

export type LearnerAccessUser = Pick<TUser, 'email' | 'id' | 'image' | 'name'> &
  Pick<TLearnerMember, 'role' | 'status'>

export type LearnerWithGoals = TLearner & {
  goals: GoalWithProgress[]
}

export type LearnerListItem = TLearner & {
  groupId: string | null
  role: TLearnerMember['role']
}

export type LearnerListItemWithToday = LearnerListItem & {
  goalsUpdatedToday: number
  activitiesAddedToday: number
}

export type LearnerGroupWithLearners = TLearnerGroup & {
  learners: LearnerListItem[]
}

export type LearnerGroupWithToday = Omit<LearnerGroupWithLearners, 'learners'> & {
  learners: LearnerListItemWithToday[]
}

export type OrganizedLearners = {
  groups: LearnerGroupWithLearners[]
  ungrouped: LearnerListItem[]
}

import type { TGoal, TGoalGroup, TLearningRecord } from '~/db/schema'

export type GoalProgressEntryWithUser = Omit<TLearningRecord, 'goalId' | 'value'> & {
  goalId: string
  value: number
  recordedByName: string
}

export type GoalWithProgress = TGoal & {
  currentValue: number
  entries: GoalProgressEntryWithUser[]
}

export type GoalGroupWithGoals = TGoalGroup & {
  goals: GoalWithProgress[]
}

import type { TDailySchedule, TLearningRecord, TScheduleItem, TScheduleTodo } from '~/db/schema'

export type ScheduleSourceType = 'activity_track' | 'goal'

export type SchedulePlanInputItem = {
  sourceType: ScheduleSourceType
  sourceId: string
  plannedDurationMinutes: number
}

export type ScheduleSourceOption = {
  id: string
  sourceType: ScheduleSourceType
  title: string
  detail: string
}

export type ScheduleTodoWithProgress = TScheduleTodo & {
  completed: boolean
  actualDurationMinutes: number
  records: Pick<TLearningRecord, 'durationMinutes' | 'id'>[]
}

export type ScheduleRange = {
  schedule?: TDailySchedule
  planItems: TScheduleItem[]
  todos: ScheduleTodoWithProgress[]
}

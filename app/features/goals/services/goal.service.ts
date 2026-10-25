import { randomUUID } from 'node:crypto'
import type { TGoalGroup, TLearningRecord } from '~/db/schema'
import * as learnerQueries from '~/features/learners/queries'
import * as scheduleService from '~/features/schedules/services'
import * as goalQueries from '../queries'
import type { TCreateGoal, TSaveProgressEntry } from '../schemas/form/goal-schema'
import type { GoalProgressEntryWithUser, GoalWithProgress } from '../types'

function utcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}

function currentUtcDate(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

async function canManage(learnerId: string, userId: string): Promise<boolean> {
  return learnerQueries.canContribute(learnerId, userId)
}

export const findGroupsForLearner = goalQueries.findGroupsByLearnerId

export async function findWithProgress(learnerId: string): Promise<GoalWithProgress[]> {
  const goals = await goalQueries.findByLearnerId(learnerId)
  const entries = await goalQueries.findEntriesByGoalIds(goals.map((goal) => goal.id))
  const entriesByGoal = new Map<string, GoalProgressEntryWithUser[]>()

  for (const entry of entries) {
    const goalEntries = entriesByGoal.get(entry.goalId) ?? []
    goalEntries.push(entry)
    entriesByGoal.set(entry.goalId, goalEntries)
  }

  return goals.map((goal) => {
    const goalEntries = entriesByGoal.get(goal.id) ?? []
    return {
      ...goal,
      entries: goalEntries,
      currentValue: goalEntries.reduce((total, entry) => total + entry.value, 0),
    }
  })
}

export async function findDetailForUser(goalId: string, userId: string) {
  const goal = await goalQueries.findByIdForDetail(goalId)
  if (!goal) return undefined

  const learner = await learnerQueries.findByIdForUser(goal.learnerId, userId)
  if (!learner) return undefined

  const [entries, userCanManage] = await Promise.all([
    goalQueries.findEntriesByGoalIds([goal.id]),
    canManage(goal.learnerId, userId),
  ])

  return {
    learner,
    canManage: userCanManage,
    goal: {
      ...goal,
      entries,
      currentValue: entries.reduce((total, entry) => total + entry.value, 0),
    },
  }
}

export async function createForLearner(
  learnerId: string,
  userId: string,
  data: TCreateGoal,
): Promise<GoalWithProgress | undefined> {
  if (!(await canManage(learnerId, userId))) return undefined
  const now = new Date()
  if (data.groupId) {
    const group = await goalQueries.findGroupsByLearnerId(learnerId)
    if (!group.some((item) => item.id === data.groupId)) return undefined
  }
  const goal = await goalQueries.create({
    id: randomUUID(),
    learnerId,
    groupId: data.groupId || null,
    title: data.title,
    description: data.description || null,
    targetValue: data.targetValue,
    unit: data.unit,
    startDate: utcDate(data.startDate),
    endDate: utcDate(data.endDate),
    createdAt: now,
    updatedAt: now,
  })
  return { ...goal, currentValue: 0, entries: [] }
}

export type GoalGroupResult = TGoalGroup | 'duplicate' | undefined

export async function createGroupForLearner(
  learnerId: string,
  userId: string,
  name: string,
): Promise<GoalGroupResult> {
  if (!(await canManage(learnerId, userId))) return undefined
  if (await goalQueries.findGroupByName(learnerId, name)) return 'duplicate'
  const groups = await goalQueries.findGroupsByLearnerId(learnerId)
  const now = new Date()
  return goalQueries.createGroup({
    id: randomUUID(),
    learnerId,
    name,
    position: groups.length,
    sourceTemplateId: null,
    sourceTemplateTitle: null,
    createdByUserId: userId,
    createdAt: now,
    updatedAt: now,
  })
}

export async function renameGroupForLearner(
  learnerId: string,
  userId: string,
  groupId: string,
  name: string,
): Promise<GoalGroupResult> {
  if (!(await canManage(learnerId, userId))) return undefined
  const duplicate = await goalQueries.findGroupByName(learnerId, name)
  if (duplicate && duplicate.id !== groupId) return 'duplicate'
  return goalQueries.renameGroup(groupId, learnerId, name)
}

export async function deleteGroupForLearner(
  learnerId: string,
  userId: string,
  groupId: string,
): Promise<boolean> {
  if (!(await canManage(learnerId, userId))) return false
  return goalQueries.deleteGroup(groupId, learnerId)
}

export async function moveToGroupForLearner(
  learnerId: string,
  userId: string,
  goalId: string,
  groupId: string | null,
): Promise<boolean> {
  if (!(await canManage(learnerId, userId))) return false
  return goalQueries.moveGoalToGroup(goalId, learnerId, groupId)
}

export async function saveEntryForLearner(
  learnerId: string,
  userId: string,
  goalId: string,
  data: TSaveProgressEntry,
): Promise<TLearningRecord | undefined> {
  if (!(await canManage(learnerId, userId))) return undefined
  const goal = await goalQueries.findById(goalId, learnerId)
  if (!goal) return undefined

  const activityDate = data.activityDate ? utcDate(data.activityDate) : currentUtcDate()
  if (activityDate < goal.startDate || activityDate > goal.endDate) {
    throw new RangeError('Entry date must be within the goal period')
  }

  const now = new Date()
  const scheduleTodoId = await scheduleService.findMatchingTodoId({
    learnerId,
    scheduledDate: activityDate.toISOString().slice(0, 10),
    goalId,
    preferredTodoId: data.scheduleTodoId,
  })
  return goalQueries.saveProgressEntry({
    id: randomUUID(),
    learnerId,
    goalId,
    trackId: null,
    scheduleTodoId,
    recordedByUserId: userId,
    activityDate,
    title: goal.title,
    durationMinutes: data.durationMinutes ?? null,
    value: data.value,
    unit: goal.unit,
    note: data.note || null,
    createdAt: now,
    updatedAt: now,
  })
}

export async function deleteEntryForLearner(
  learnerId: string,
  userId: string,
  goalId: string,
  entryId: string,
): Promise<boolean> {
  if (!(await canManage(learnerId, userId))) return false
  const goal = await goalQueries.findById(goalId, learnerId)
  if (!goal) return false
  return goalQueries.deleteProgressEntry(entryId, goalId)
}

export async function deleteForLearner(
  learnerId: string,
  userId: string,
  goalId: string,
): Promise<boolean> {
  if (!(await canManage(learnerId, userId))) return false
  return goalQueries.deleteById(goalId, learnerId)
}

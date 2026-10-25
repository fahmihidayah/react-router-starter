import { randomUUID } from 'node:crypto'
import type { TActivityTrack, TLearningRecord } from '~/db/schema'
import * as learnerQueries from '~/features/learners/queries'
import * as scheduleService from '~/features/schedules/services'
import * as activityQueries from '../queries'
import type { TCreateActivity, TCreateTrack } from '../schemas/form/activity-schema'
import type { ActivityTrackDetail, LearnerActivities } from '../types'

function utcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}

async function canManage(learnerId: string, userId: string): Promise<boolean> {
  return learnerQueries.canContribute(learnerId, userId)
}

export async function findForLearner(learnerId: string): Promise<LearnerActivities> {
  const [activities, tracks] = await Promise.all([
    activityQueries.findActivitiesByLearnerId(learnerId),
    activityQueries.findTracksByLearnerId(learnerId),
  ])
  return { activities, tracks }
}

export const findTracksForLearner = activityQueries.findTracksByLearnerId
export const findAllTracksForLearner = activityQueries.findAllTracksByLearnerId

export async function findDashboardReport(learnerIds: string[], today: string) {
  const firstDay = utcDate(today)
  firstDay.setUTCDate(firstDay.getUTCDate() - 6)
  const [recentRecords, weeklyRecords] = await Promise.all([
    activityQueries.findRecentRecordsByLearnerIds(learnerIds, 10),
    activityQueries.findRecordsByLearnerIdsFromDate(learnerIds, firstDay),
  ])
  const recordsByDate = new Map<
    string,
    { activityCount: number; goalUpdateCount: number; learnerIds: Set<string> }
  >()

  for (const record of weeklyRecords) {
    const key = record.activityDate.toISOString().slice(0, 10)
    const summary = recordsByDate.get(key) ?? {
      activityCount: 0,
      goalUpdateCount: 0,
      learnerIds: new Set<string>(),
    }
    if (record.goalId) summary.goalUpdateCount += 1
    else summary.activityCount += 1
    summary.learnerIds.add(record.learnerId)
    recordsByDate.set(key, summary)
  }

  const weekly = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(firstDay)
    date.setUTCDate(firstDay.getUTCDate() + index)
    const key = date.toISOString().slice(0, 10)
    const summary = recordsByDate.get(key)
    return {
      date: key,
      activityCount: summary?.activityCount ?? 0,
      goalUpdateCount: summary?.goalUpdateCount ?? 0,
      activeLearnerCount: summary?.learnerIds.size ?? 0,
    }
  })

  return { recentRecords, weekly }
}

export async function findTrackDetailForUser(
  trackId: string,
  userId: string,
): Promise<ActivityTrackDetail | undefined> {
  const track = await activityQueries.findTrackByIdForDetail(trackId)
  if (!track) return undefined

  const learner = await learnerQueries.findByIdForUser(track.learnerId, userId)
  if (!learner) return undefined

  const [activities, userCanManage] = await Promise.all([
    activityQueries.findActivitiesByTrackId(track.id),
    canManage(track.learnerId, userId),
  ])

  return { track, learner, activities, canManage: userCanManage }
}

export async function findTodaySummaries(learnerIds: string[], date: string) {
  const records = await activityQueries.findRecordContextsByLearnerIdsOnDate(
    learnerIds,
    utcDate(date),
  )
  const goalsByLearner = new Map<string, Set<string>>()
  const activitiesByLearner = new Map<string, number>()

  for (const record of records) {
    if (record.goalId) {
      const goalIds = goalsByLearner.get(record.learnerId) ?? new Set<string>()
      goalIds.add(record.goalId)
      goalsByLearner.set(record.learnerId, goalIds)
    } else {
      activitiesByLearner.set(
        record.learnerId,
        (activitiesByLearner.get(record.learnerId) ?? 0) + 1,
      )
    }
  }

  return new Map(
    learnerIds.map((learnerId) => [
      learnerId,
      {
        goalsUpdated: goalsByLearner.get(learnerId)?.size ?? 0,
        activitiesAdded: activitiesByLearner.get(learnerId) ?? 0,
      },
    ]),
  )
}

export async function createForLearner(
  learnerId: string,
  userId: string,
  data: TCreateActivity,
): Promise<TLearningRecord | undefined> {
  if (!(await canManage(learnerId, userId))) return undefined
  const track = await activityQueries.findTrackById(data.trackId, learnerId)
  if (!track || track.archivedAt) return undefined

  const now = new Date()
  const scheduleTodoId = await scheduleService.findMatchingTodoId({
    learnerId,
    scheduledDate: data.activityDate,
    trackId: data.trackId,
    preferredTodoId: data.scheduleTodoId,
  })
  return activityQueries.createRecord({
    id: randomUUID(),
    learnerId,
    goalId: null,
    trackId: data.trackId,
    scheduleTodoId,
    recordedByUserId: userId,
    activityDate: utcDate(data.activityDate),
    title: data.title,
    durationMinutes: data.durationMinutes ?? null,
    value: data.value ?? null,
    unit: data.unit ?? null,
    note: data.note || null,
    createdAt: now,
    updatedAt: now,
  })
}

export async function deleteForLearner(
  learnerId: string,
  userId: string,
  activityId: string,
): Promise<boolean> {
  if (!(await canManage(learnerId, userId))) return false
  return activityQueries.deleteRecord(activityId, learnerId)
}

export async function createTrackForLearner(
  learnerId: string,
  userId: string,
  data: TCreateTrack,
): Promise<TActivityTrack | 'duplicate' | undefined> {
  if (!(await canManage(learnerId, userId))) return undefined
  if (await activityQueries.findActiveTrackByName(learnerId, data.name)) return 'duplicate'
  const now = new Date()
  return activityQueries.createTrack({
    id: randomUUID(),
    learnerId,
    name: data.name,
    createdAt: now,
    updatedAt: now,
  })
}

export async function renameTrackForLearner(
  learnerId: string,
  userId: string,
  trackId: string,
  data: TCreateTrack,
): Promise<TActivityTrack | 'duplicate' | undefined> {
  if (!(await canManage(learnerId, userId))) return undefined
  const duplicate = await activityQueries.findActiveTrackByName(learnerId, data.name)
  if (duplicate && duplicate.id !== trackId) return 'duplicate'
  return activityQueries.renameTrack(trackId, learnerId, data.name)
}

export async function archiveTrackForLearner(
  learnerId: string,
  userId: string,
  trackId: string,
): Promise<boolean> {
  if (!(await canManage(learnerId, userId))) return false
  return activityQueries.archiveTrack(trackId, learnerId)
}

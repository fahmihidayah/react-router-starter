import { and, desc, eq, gte, inArray, isNull } from 'drizzle-orm'
import {
  activityTracks,
  learningRecords,
  type TActivityTrack,
  type TInsertActivityTrack,
  type TInsertLearningRecord,
  type TLearningRecord,
  users,
} from '~/db/schema'
import { db } from '~/lib/database'
import type { LearningRecordWithDetails } from '../types'

export function findTracksByLearnerId(learnerId: string): Promise<TActivityTrack[]> {
  return db.query.activityTracks.findMany({
    where: { learnerId, archivedAt: { isNull: true } },
    orderBy: { name: 'asc' },
  })
}

export function findAllTracksByLearnerId(learnerId: string): Promise<TActivityTrack[]> {
  return db.query.activityTracks.findMany({
    where: { learnerId },
    orderBy: { name: 'asc' },
  })
}

export async function findTrackById(
  id: string,
  learnerId: string,
): Promise<TActivityTrack | undefined> {
  return db.query.activityTracks.findFirst({ where: { id, learnerId } })
}

export function findTrackByIdForDetail(id: string): Promise<TActivityTrack | undefined> {
  return db.query.activityTracks.findFirst({ where: { id } })
}

export async function findActiveTrackByName(
  learnerId: string,
  name: string,
): Promise<TActivityTrack | undefined> {
  const [track] = await db
    .select()
    .from(activityTracks)
    .where(
      and(
        eq(activityTracks.learnerId, learnerId),
        eq(activityTracks.name, name),
        isNull(activityTracks.archivedAt),
      ),
    )
    .limit(1)
  return track
}

export async function findRecordsByLearnerIds(
  learnerIds: string[],
): Promise<LearningRecordWithDetails[]> {
  if (learnerIds.length === 0) return []
  const rows = await db
    .select({
      record: learningRecords,
      recordedByName: users.name,
      trackName: activityTracks.name,
    })
    .from(learningRecords)
    .innerJoin(users, eq(users.id, learningRecords.recordedByUserId))
    .leftJoin(activityTracks, eq(activityTracks.id, learningRecords.trackId))
    .where(inArray(learningRecords.learnerId, learnerIds))
    .orderBy(desc(learningRecords.activityDate), desc(learningRecords.createdAt))

  return rows.map(({ record, recordedByName, trackName }) => ({
    ...record,
    recordedByName,
    trackName,
  }))
}

export async function findRecentRecordsByLearnerIds(
  learnerIds: string[],
  limit: number,
): Promise<LearningRecordWithDetails[]> {
  if (learnerIds.length === 0) return []
  const rows = await db
    .select({
      record: learningRecords,
      recordedByName: users.name,
      trackName: activityTracks.name,
    })
    .from(learningRecords)
    .innerJoin(users, eq(users.id, learningRecords.recordedByUserId))
    .leftJoin(activityTracks, eq(activityTracks.id, learningRecords.trackId))
    .where(inArray(learningRecords.learnerId, learnerIds))
    .orderBy(desc(learningRecords.createdAt))
    .limit(limit)

  return rows.map(({ record, recordedByName, trackName }) => ({
    ...record,
    recordedByName,
    trackName,
  }))
}

export async function findRecordsByLearnerIdsFromDate(
  learnerIds: string[],
  fromDate: Date,
): Promise<LearningRecordWithDetails[]> {
  if (learnerIds.length === 0) return []
  const rows = await db
    .select({
      record: learningRecords,
      recordedByName: users.name,
      trackName: activityTracks.name,
    })
    .from(learningRecords)
    .innerJoin(users, eq(users.id, learningRecords.recordedByUserId))
    .leftJoin(activityTracks, eq(activityTracks.id, learningRecords.trackId))
    .where(
      and(
        inArray(learningRecords.learnerId, learnerIds),
        gte(learningRecords.activityDate, fromDate),
      ),
    )
    .orderBy(learningRecords.activityDate, learningRecords.createdAt)

  return rows.map(({ record, recordedByName, trackName }) => ({
    ...record,
    recordedByName,
    trackName,
  }))
}

export async function findRecordContextsByLearnerIdsOnDate(
  learnerIds: string[],
  activityDate: Date,
): Promise<Pick<TLearningRecord, 'goalId' | 'learnerId'>[]> {
  if (learnerIds.length === 0) return []
  return db
    .select({ learnerId: learningRecords.learnerId, goalId: learningRecords.goalId })
    .from(learningRecords)
    .where(
      and(
        inArray(learningRecords.learnerId, learnerIds),
        eq(learningRecords.activityDate, activityDate),
      ),
    )
}

export function findActivitiesByLearnerId(learnerId: string): Promise<LearningRecordWithDetails[]> {
  return findRecordsByLearnerIds([learnerId]).then((records) =>
    records.filter((record) => record.goalId === null),
  )
}

export async function findActivitiesByTrackId(
  trackId: string,
): Promise<LearningRecordWithDetails[]> {
  const rows = await db
    .select({
      record: learningRecords,
      recordedByName: users.name,
      trackName: activityTracks.name,
    })
    .from(learningRecords)
    .innerJoin(users, eq(users.id, learningRecords.recordedByUserId))
    .leftJoin(activityTracks, eq(activityTracks.id, learningRecords.trackId))
    .where(and(eq(learningRecords.trackId, trackId), isNull(learningRecords.goalId)))
    .orderBy(desc(learningRecords.activityDate), desc(learningRecords.createdAt))

  return rows.map(({ record, recordedByName, trackName }) => ({
    ...record,
    recordedByName,
    trackName,
  }))
}

export async function createRecord(data: TInsertLearningRecord): Promise<TLearningRecord> {
  const [record] = await db.insert(learningRecords).values(data).returning()
  return record
}

export async function deleteRecord(id: string, learnerId: string): Promise<boolean> {
  const deleted = await db
    .delete(learningRecords)
    .where(
      and(
        eq(learningRecords.id, id),
        eq(learningRecords.learnerId, learnerId),
        isNull(learningRecords.goalId),
      ),
    )
    .returning({ id: learningRecords.id })
  return deleted.length > 0
}

export async function createTrack(data: TInsertActivityTrack): Promise<TActivityTrack> {
  const [track] = await db.insert(activityTracks).values(data).returning()
  return track
}

export async function renameTrack(
  id: string,
  learnerId: string,
  name: string,
): Promise<TActivityTrack | undefined> {
  const [track] = await db
    .update(activityTracks)
    .set({ name, updatedAt: new Date() })
    .where(and(eq(activityTracks.id, id), eq(activityTracks.learnerId, learnerId)))
    .returning()
  return track
}

export async function archiveTrack(id: string, learnerId: string): Promise<boolean> {
  const archived = await db
    .update(activityTracks)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(activityTracks.id, id), eq(activityTracks.learnerId, learnerId)))
    .returning({ id: activityTracks.id })
  return archived.length > 0
}

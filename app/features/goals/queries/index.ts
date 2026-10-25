import { and, asc, desc, eq, ilike, inArray } from 'drizzle-orm'
import {
  goalGroups,
  goals,
  learningRecords,
  type TGoal,
  type TGoalGroup,
  type TInsertGoal,
  type TInsertGoalGroup,
  type TInsertLearningRecord,
  type TLearningRecord,
  users,
} from '~/db/schema'
import { db } from '~/lib/database'
import type { GoalProgressEntryWithUser } from '../types'

export function findByLearnerId(learnerId: string): Promise<TGoal[]> {
  return db.query.goals.findMany({
    where: { learnerId },
    orderBy: { createdAt: 'desc' },
  })
}

export function findGroupsByLearnerId(learnerId: string): Promise<TGoalGroup[]> {
  return db.query.goalGroups.findMany({
    where: { learnerId },
    orderBy: { position: 'asc', createdAt: 'asc' },
  })
}

export async function findGroupByName(
  learnerId: string,
  name: string,
): Promise<TGoalGroup | undefined> {
  const [group] = await db
    .select()
    .from(goalGroups)
    .where(and(eq(goalGroups.learnerId, learnerId), ilike(goalGroups.name, name)))
    .orderBy(asc(goalGroups.createdAt))
    .limit(1)
  return group
}

export async function createGroup(data: TInsertGoalGroup): Promise<TGoalGroup> {
  const [group] = await db.insert(goalGroups).values(data).returning()
  return group
}

export async function renameGroup(
  id: string,
  learnerId: string,
  name: string,
): Promise<TGoalGroup | undefined> {
  const [group] = await db
    .update(goalGroups)
    .set({ name, updatedAt: new Date() })
    .where(and(eq(goalGroups.id, id), eq(goalGroups.learnerId, learnerId)))
    .returning()
  return group
}

export async function deleteGroup(id: string, learnerId: string): Promise<boolean> {
  const deleted = await db
    .delete(goalGroups)
    .where(and(eq(goalGroups.id, id), eq(goalGroups.learnerId, learnerId)))
    .returning({ id: goalGroups.id })
  return deleted.length > 0
}

export async function moveGoalToGroup(
  goalId: string,
  learnerId: string,
  groupId: string | null,
): Promise<boolean> {
  if (groupId) {
    const group = await db.query.goalGroups.findFirst({ where: { id: groupId, learnerId } })
    if (!group) return false
  }
  const [updated] = await db
    .update(goals)
    .set({ groupId, updatedAt: new Date() })
    .where(and(eq(goals.id, goalId), eq(goals.learnerId, learnerId)))
    .returning({ id: goals.id })
  return Boolean(updated)
}

export async function findById(id: string, learnerId: string): Promise<TGoal | undefined> {
  return db.query.goals.findFirst({ where: { id, learnerId } })
}

export async function findByIdForDetail(id: string): Promise<TGoal | undefined> {
  return db.query.goals.findFirst({ where: { id } })
}

export async function findEntriesByGoalIds(
  goalIds: string[],
): Promise<GoalProgressEntryWithUser[]> {
  if (goalIds.length === 0) return Promise.resolve([])
  const rows = await db
    .select({ entry: learningRecords, recordedByName: users.name })
    .from(learningRecords)
    .innerJoin(users, eq(users.id, learningRecords.recordedByUserId))
    .where(inArray(learningRecords.goalId, goalIds))
    .orderBy(desc(learningRecords.activityDate), desc(learningRecords.createdAt))

  return rows.flatMap(({ entry, recordedByName }) => {
    if (!entry.goalId || entry.value === null) return []
    return [{ ...entry, goalId: entry.goalId, value: entry.value, recordedByName }]
  })
}

export async function create(data: TInsertGoal): Promise<TGoal> {
  const [goal] = await db.insert(goals).values(data).returning()
  return goal
}

export async function saveProgressEntry(data: TInsertLearningRecord): Promise<TLearningRecord> {
  const [entry] = await db.insert(learningRecords).values(data).returning()
  return entry
}

export async function deleteProgressEntry(id: string, goalId: string): Promise<boolean> {
  const deleted = await db
    .delete(learningRecords)
    .where(and(eq(learningRecords.id, id), eq(learningRecords.goalId, goalId)))
    .returning({ id: learningRecords.id })
  return deleted.length > 0
}

export async function deleteById(id: string, learnerId: string): Promise<boolean> {
  const deleted = await db
    .delete(goals)
    .where(and(eq(goals.id, id), eq(goals.learnerId, learnerId)))
    .returning({ id: goals.id })
  return deleted.length > 0
}

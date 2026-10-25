import { randomUUID } from 'node:crypto'
import type { TLearner, TLearnerGroup } from '~/db/schema'
import * as learnerQueries from '../queries'
import type {
  TAddLearnerAccess,
  TCreateLearner,
  TUpdateLearner,
} from '../schemas/form/learner-schema'

function nullableDate(value?: string): Date | null {
  return value ? new Date(`${value}T00:00:00.000Z`) : null
}

export function findAllForUser(userId: string): Promise<TLearner[]> {
  return learnerQueries.findAllForUser(userId)
}

export function findAllContributableForUser(userId: string): Promise<TLearner[]> {
  return learnerQueries.findAllContributableForUser(userId)
}

export function findByIdForUser(id: string, userId: string): Promise<TLearner | undefined> {
  return learnerQueries.findByIdForUser(id, userId)
}

export function findByIdOwned(id: string, userId: string): Promise<TLearner | undefined> {
  return learnerQueries.findByIdOwned(id, userId)
}

export async function findOrganizedForUser(userId: string) {
  const [groups, learners] = await Promise.all([
    learnerQueries.findGroupsForUser(userId),
    learnerQueries.findAllWithMembershipForUser(userId),
  ])
  return {
    groups: groups.map((group) => ({
      ...group,
      learners: learners.filter((learner) => learner.groupId === group.id),
    })),
    ungrouped: learners.filter((learner) => !learner.groupId),
  }
}

export async function getDetailForUser(id: string, userId: string) {
  const learner = await learnerQueries.findByIdForUser(id, userId)
  if (!learner) return undefined

  const membership = await learnerQueries.findMembership(id, userId)
  if (!membership) return undefined
  const accessUsers = membership.role === 'owner' ? await learnerQueries.findAccessUsers(id) : []

  return { learner, accessUsers, memberRole: membership.role }
}

export function createForUser(data: TCreateLearner, userId: string): Promise<TLearner> {
  const now = new Date()
  return learnerQueries.createForUser(
    {
      id: randomUUID(),
      name: data.name,
      dateOfBirth: nullableDate(data.dateOfBirth),
      avatar: data.avatar || null,
      createdAt: now,
      updatedAt: now,
    },
    userId,
  )
}

export function updateForUser(
  id: string,
  userId: string,
  data: TUpdateLearner,
): Promise<TLearner | undefined> {
  return learnerQueries.updateForUser(id, userId, {
    name: data.name,
    dateOfBirth: nullableDate(data.dateOfBirth),
    avatar: data.avatar || null,
  })
}

export function deleteForUser(id: string, userId: string): Promise<boolean> {
  return learnerQueries.deleteForUser(id, userId)
}

export async function addAccessForUser(
  learnerId: string,
  ownerId: string,
  data: TAddLearnerAccess,
): Promise<learnerQueries.AddAccessResult | 'learner-not-found'> {
  const learner = await learnerQueries.findByIdOwned(learnerId, ownerId)
  if (!learner) return 'learner-not-found'

  return learnerQueries.addAccessByEmail(learnerId, data.email, data.role)
}

export type LearnerGroupResult = TLearnerGroup | 'duplicate' | undefined

export async function createGroupForUser(
  name: string,
  userId: string,
): Promise<LearnerGroupResult> {
  if (await learnerQueries.findGroupByName(userId, name)) return 'duplicate'
  const groups = await learnerQueries.findGroupsForUser(userId)
  const now = new Date()
  return learnerQueries.createGroup({
    id: randomUUID(),
    ownerUserId: userId,
    name,
    position: groups.length,
    createdAt: now,
    updatedAt: now,
  })
}

export async function renameGroupForUser(
  groupId: string,
  name: string,
  userId: string,
): Promise<LearnerGroupResult> {
  const duplicate = await learnerQueries.findGroupByName(userId, name)
  if (duplicate && duplicate.id !== groupId) return 'duplicate'
  return learnerQueries.renameGroup(groupId, userId, name)
}

export function deleteGroupForUser(groupId: string, userId: string): Promise<boolean> {
  return learnerQueries.deleteGroup(groupId, userId)
}

export function moveToGroupForUser(
  learnerId: string,
  groupId: string | null,
  userId: string,
): Promise<boolean> {
  return learnerQueries.moveLearnerToGroup(learnerId, userId, groupId)
}

import { and, desc, eq, ilike, ne } from 'drizzle-orm'
import {
  learnerGroups,
  learnerMembers,
  learners,
  type TInsertLearner,
  type TInsertLearnerGroup,
  type TLearner,
  type TLearnerGroup,
  type TLearnerMember,
  users,
} from '~/db/schema'
import { db } from '~/lib/database'
import type { LearnerAccessUser, LearnerListItem } from '../types'

const activeAccess = (userId: string) =>
  and(eq(learnerMembers.userId, userId), eq(learnerMembers.status, 'active'))

const ownerAccess = (userId: string) => and(activeAccess(userId), eq(learnerMembers.role, 'owner'))

export async function createForUser(learner: TInsertLearner, userId: string): Promise<TLearner> {
  return db.transaction(async (transaction) => {
    const [created] = await transaction.insert(learners).values(learner).returning()
    const now = new Date()

    await transaction.insert(learnerMembers).values({
      id: crypto.randomUUID(),
      learnerId: created.id,
      userId,
      role: 'owner',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    })

    return created
  })
}

export async function findAllForUser(userId: string): Promise<TLearner[]> {
  const rows = await db
    .select({ learner: learners })
    .from(learners)
    .innerJoin(learnerMembers, eq(learnerMembers.learnerId, learners.id))
    .where(activeAccess(userId))
    .orderBy(desc(learners.createdAt))

  return rows.map(({ learner }) => learner)
}

export async function findAllContributableForUser(userId: string): Promise<TLearner[]> {
  const rows = await db
    .select({ learner: learners })
    .from(learners)
    .innerJoin(learnerMembers, eq(learnerMembers.learnerId, learners.id))
    .where(and(activeAccess(userId), ne(learnerMembers.role, 'viewer')))
    .orderBy(desc(learners.createdAt))

  return rows.map(({ learner }) => learner)
}

export async function findAllWithMembershipForUser(userId: string): Promise<LearnerListItem[]> {
  const rows = await db
    .select({
      learner: learners,
      groupId: learnerMembers.groupId,
      role: learnerMembers.role,
    })
    .from(learners)
    .innerJoin(learnerMembers, eq(learnerMembers.learnerId, learners.id))
    .where(activeAccess(userId))
    .orderBy(desc(learners.createdAt))

  return rows.map(({ learner, groupId, role }) => ({ ...learner, groupId, role }))
}

export async function findByIdForUser(id: string, userId: string): Promise<TLearner | undefined> {
  const [row] = await db
    .select({ learner: learners })
    .from(learners)
    .innerJoin(learnerMembers, eq(learnerMembers.learnerId, learners.id))
    .where(and(eq(learners.id, id), activeAccess(userId)))
    .limit(1)

  return row?.learner
}

export async function findByIdOwned(id: string, userId: string): Promise<TLearner | undefined> {
  const [row] = await db
    .select({ learner: learners })
    .from(learners)
    .innerJoin(learnerMembers, eq(learnerMembers.learnerId, learners.id))
    .where(and(eq(learners.id, id), ownerAccess(userId)))
    .limit(1)

  return row?.learner
}

export async function findMembership(
  learnerId: string,
  userId: string,
): Promise<TLearnerMember | undefined> {
  return db.query.learnerMembers.findFirst({
    where: { learnerId, userId, status: 'active' },
  })
}

export async function canContribute(learnerId: string, userId: string): Promise<boolean> {
  const membership = await findMembership(learnerId, userId)
  return Boolean(membership && ['owner', 'parent', 'teacher'].includes(membership.role))
}

export function findGroupsForUser(userId: string): Promise<TLearnerGroup[]> {
  return db.query.learnerGroups.findMany({
    where: { ownerUserId: userId },
    orderBy: { position: 'asc', name: 'asc' },
  })
}

export async function findGroupByName(
  userId: string,
  name: string,
): Promise<TLearnerGroup | undefined> {
  const [group] = await db
    .select()
    .from(learnerGroups)
    .where(and(eq(learnerGroups.ownerUserId, userId), ilike(learnerGroups.name, name)))
    .limit(1)
  return group
}

export async function createGroup(data: TInsertLearnerGroup): Promise<TLearnerGroup> {
  const [group] = await db.insert(learnerGroups).values(data).returning()
  return group
}

export async function renameGroup(
  id: string,
  userId: string,
  name: string,
): Promise<TLearnerGroup | undefined> {
  const [group] = await db
    .update(learnerGroups)
    .set({ name, updatedAt: new Date() })
    .where(and(eq(learnerGroups.id, id), eq(learnerGroups.ownerUserId, userId)))
    .returning()
  return group
}

export async function deleteGroup(id: string, userId: string): Promise<boolean> {
  const deleted = await db
    .delete(learnerGroups)
    .where(and(eq(learnerGroups.id, id), eq(learnerGroups.ownerUserId, userId)))
    .returning({ id: learnerGroups.id })
  return deleted.length > 0
}

export async function moveLearnerToGroup(
  learnerId: string,
  userId: string,
  groupId: string | null,
): Promise<boolean> {
  if (groupId) {
    const group = await db.query.learnerGroups.findFirst({
      where: { id: groupId, ownerUserId: userId },
    })
    if (!group) return false
  }

  const [updated] = await db
    .update(learnerMembers)
    .set({ groupId, updatedAt: new Date() })
    .where(
      and(
        eq(learnerMembers.learnerId, learnerId),
        eq(learnerMembers.userId, userId),
        eq(learnerMembers.status, 'active'),
      ),
    )
    .returning({ id: learnerMembers.id })
  return Boolean(updated)
}

export async function findAccessUsers(learnerId: string): Promise<LearnerAccessUser[]> {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: learnerMembers.role,
      status: learnerMembers.status,
    })
    .from(learnerMembers)
    .innerJoin(users, eq(users.id, learnerMembers.userId))
    .where(and(eq(learnerMembers.learnerId, learnerId), eq(learnerMembers.status, 'active')))
    .orderBy(desc(learnerMembers.createdAt))
}

export type AddAccessResult = 'added' | 'already-exists' | 'user-not-found'

export async function addAccessByEmail(
  learnerId: string,
  email: string,
  role: 'parent' | 'teacher' | 'viewer',
): Promise<AddAccessResult> {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(ilike(users.email, email))
    .limit(1)
  if (!user) return 'user-not-found'

  const [existingMember] = await db
    .select({ id: learnerMembers.id, status: learnerMembers.status })
    .from(learnerMembers)
    .where(and(eq(learnerMembers.learnerId, learnerId), eq(learnerMembers.userId, user.id)))
    .limit(1)

  const now = new Date()
  if (existingMember?.status === 'active') return 'already-exists'

  if (existingMember) {
    await db
      .update(learnerMembers)
      .set({ role, status: 'active', updatedAt: now })
      .where(eq(learnerMembers.id, existingMember.id))
  } else {
    await db.insert(learnerMembers).values({
      id: crypto.randomUUID(),
      learnerId,
      userId: user.id,
      role,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    })
  }

  return 'added'
}

export async function updateForUser(
  id: string,
  userId: string,
  data: Pick<TInsertLearner, 'avatar' | 'dateOfBirth' | 'name'>,
): Promise<TLearner | undefined> {
  const ownedLearner = await findByIdOwned(id, userId)
  if (!ownedLearner) return undefined

  const [updated] = await db
    .update(learners)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(learners.id, id))
    .returning()

  return updated
}

export async function deleteForUser(id: string, userId: string): Promise<boolean> {
  const ownedLearner = await findByIdOwned(id, userId)
  if (!ownedLearner) return false

  const deleted = await db
    .delete(learners)
    .where(eq(learners.id, id))
    .returning({ id: learners.id })
  return deleted.length > 0
}

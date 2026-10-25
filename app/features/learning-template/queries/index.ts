import { and, asc, count, desc, eq, isNull, ne, or } from 'drizzle-orm'
import {
  auditLogs,
  auditLogTemplates,
  goalGroups,
  goals,
  learningTemplateGoals,
  learningTemplates,
  type TInsertAuditLog,
  type TInsertAuditLogTemplate,
  type TInsertGoal,
  type TInsertGoalGroup,
  type TInsertLearningTemplate,
  type TInsertLearningTemplateGoal,
  type TLearningTemplate,
  type TLearningTemplateGoal,
  users,
} from '~/db/schema'
import { db } from '~/lib/database'
import type {
  LearningTemplateCatalog,
  LearningTemplateCatalogItem,
  LearningTemplateWithGoals,
} from '../types'

const activeTemplate = isNull(learningTemplates.archivedAt)

function catalogRows(userId: string, owned: boolean): Promise<LearningTemplateCatalogItem[]> {
  const ownership = owned
    ? eq(learningTemplates.ownerUserId, userId)
    : and(eq(learningTemplates.visibility, 'public'), ne(learningTemplates.ownerUserId, userId))

  return db
    .select({
      id: learningTemplates.id,
      ownerUserId: learningTemplates.ownerUserId,
      title: learningTemplates.title,
      visibility: learningTemplates.visibility,
      archivedAt: learningTemplates.archivedAt,
      createdAt: learningTemplates.createdAt,
      updatedAt: learningTemplates.updatedAt,
      ownerName: users.name,
      goalCount: count(learningTemplateGoals.id),
    })
    .from(learningTemplates)
    .innerJoin(users, eq(users.id, learningTemplates.ownerUserId))
    .leftJoin(learningTemplateGoals, eq(learningTemplateGoals.templateId, learningTemplates.id))
    .where(and(activeTemplate, ownership))
    .groupBy(learningTemplates.id, users.name)
    .orderBy(desc(learningTemplates.updatedAt))
}

export async function findCatalogForUser(userId: string): Promise<LearningTemplateCatalog> {
  const [owned, publicFromOthers] = await Promise.all([
    catalogRows(userId, true),
    catalogRows(userId, false),
  ])
  return { owned, publicFromOthers }
}

async function findTemplate(
  id: string,
  userId: string,
  ownerOnly: boolean,
): Promise<LearningTemplateWithGoals | undefined> {
  const permission = ownerOnly
    ? eq(learningTemplates.ownerUserId, userId)
    : or(eq(learningTemplates.ownerUserId, userId), eq(learningTemplates.visibility, 'public'))
  const [row] = await db
    .select({ template: learningTemplates, ownerName: users.name })
    .from(learningTemplates)
    .innerJoin(users, eq(users.id, learningTemplates.ownerUserId))
    .where(and(eq(learningTemplates.id, id), activeTemplate, permission))
    .limit(1)
  if (!row) return undefined

  const templateGoals = await db
    .select()
    .from(learningTemplateGoals)
    .where(eq(learningTemplateGoals.templateId, id))
    .orderBy(asc(learningTemplateGoals.position), asc(learningTemplateGoals.createdAt))
  return { ...row.template, ownerName: row.ownerName, goals: templateGoals }
}

export function findByIdAccessible(
  id: string,
  userId: string,
): Promise<LearningTemplateWithGoals | undefined> {
  return findTemplate(id, userId, false)
}

export function findByIdOwned(
  id: string,
  userId: string,
): Promise<LearningTemplateWithGoals | undefined> {
  return findTemplate(id, userId, true)
}

export async function create(data: TInsertLearningTemplate): Promise<TLearningTemplate> {
  const [created] = await db.insert(learningTemplates).values(data).returning()
  return created
}

export async function update(
  id: string,
  ownerUserId: string,
  data: Pick<TInsertLearningTemplate, 'title' | 'visibility' | 'updatedAt'>,
): Promise<TLearningTemplate | undefined> {
  const [updated] = await db
    .update(learningTemplates)
    .set(data)
    .where(
      and(
        eq(learningTemplates.id, id),
        eq(learningTemplates.ownerUserId, ownerUserId),
        activeTemplate,
      ),
    )
    .returning()
  return updated
}

export async function addGoal(data: TInsertLearningTemplateGoal): Promise<TLearningTemplateGoal> {
  const [created] = await db.insert(learningTemplateGoals).values(data).returning()
  return created
}

export async function updateGoal(
  id: string,
  templateId: string,
  data: Pick<
    TInsertLearningTemplateGoal,
    'title' | 'description' | 'targetValue' | 'unit' | 'durationDays' | 'updatedAt'
  >,
): Promise<TLearningTemplateGoal | undefined> {
  const [updated] = await db
    .update(learningTemplateGoals)
    .set(data)
    .where(and(eq(learningTemplateGoals.id, id), eq(learningTemplateGoals.templateId, templateId)))
    .returning()
  return updated
}

export async function updateGoalPositions(
  templateId: string,
  positions: Array<{ id: string; position: number }>,
): Promise<void> {
  await db.transaction(async (transaction) => {
    for (const item of positions) {
      await transaction
        .update(learningTemplateGoals)
        .set({ position: item.position, updatedAt: new Date() })
        .where(
          and(
            eq(learningTemplateGoals.id, item.id),
            eq(learningTemplateGoals.templateId, templateId),
          ),
        )
    }
  })
}

export async function deleteGoal(id: string, templateId: string): Promise<boolean> {
  const deleted = await db
    .delete(learningTemplateGoals)
    .where(and(eq(learningTemplateGoals.id, id), eq(learningTemplateGoals.templateId, templateId)))
    .returning({ id: learningTemplateGoals.id })
  return deleted.length > 0
}

export async function archive(id: string, ownerUserId: string): Promise<boolean> {
  const archived = await db
    .update(learningTemplates)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(learningTemplates.id, id),
        eq(learningTemplates.ownerUserId, ownerUserId),
        activeTemplate,
      ),
    )
    .returning({ id: learningTemplates.id })
  return archived.length > 0
}

export async function wasAppliedToLearner(templateId: string, learnerId: string): Promise<boolean> {
  const [usage] = await db
    .select({ auditLogId: auditLogTemplates.auditLogId })
    .from(auditLogTemplates)
    .where(
      and(eq(auditLogTemplates.templateId, templateId), eq(auditLogTemplates.learnerId, learnerId)),
    )
    .limit(1)
  return Boolean(usage)
}

export async function applyWithAudit(input: {
  goalGroup: TInsertGoalGroup
  goals: TInsertGoal[]
  auditLog: TInsertAuditLog
  templateAudit: TInsertAuditLogTemplate
}): Promise<void> {
  await db.transaction(async (transaction) => {
    await transaction.insert(goalGroups).values(input.goalGroup)
    await transaction.insert(goals).values(input.goals)
    await transaction.insert(auditLogs).values(input.auditLog)
    await transaction.insert(auditLogTemplates).values(input.templateAudit)
  })
}

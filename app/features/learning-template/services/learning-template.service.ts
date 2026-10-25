import { randomUUID } from 'node:crypto'
import * as goalQueries from '~/features/goals/queries'
import * as learnerQueries from '~/features/learners/queries'
import * as queries from '../queries'
import type {
  TApplyLearningTemplate,
  TCreateLearningTemplate,
  TLearningTemplateGoalInput,
} from '../schemas/form/learning-template-schema'

export const findCatalogForUser = queries.findCatalogForUser
export const findByIdAccessible = queries.findByIdAccessible

export async function createForUser(data: TCreateLearningTemplate, userId: string) {
  const now = new Date()
  return queries.create({
    id: randomUUID(),
    ownerUserId: userId,
    title: data.title,
    visibility: data.visibility,
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  })
}

export async function updateForUser(id: string, userId: string, data: TCreateLearningTemplate) {
  return queries.update(id, userId, { ...data, updatedAt: new Date() })
}

export async function addGoalForUser(
  templateId: string,
  userId: string,
  data: TLearningTemplateGoalInput,
) {
  const template = await queries.findByIdOwned(templateId, userId)
  if (!template) return undefined
  const now = new Date()
  return queries.addGoal({
    id: randomUUID(),
    templateId,
    title: data.title,
    description: data.description || null,
    targetValue: data.targetValue,
    unit: data.unit,
    durationDays: data.durationDays,
    position: template.goals.length,
    createdAt: now,
    updatedAt: now,
  })
}

export async function deleteGoalForUser(templateId: string, goalId: string, userId: string) {
  if (!(await queries.findByIdOwned(templateId, userId))) return false
  return queries.deleteGoal(goalId, templateId)
}

export async function updateGoalForUser(
  templateId: string,
  goalId: string,
  userId: string,
  data: TLearningTemplateGoalInput,
) {
  const template = await queries.findByIdOwned(templateId, userId)
  if (!template?.goals.some((goal) => goal.id === goalId)) return undefined
  return queries.updateGoal(goalId, templateId, {
    title: data.title,
    description: data.description || null,
    targetValue: data.targetValue,
    unit: data.unit,
    durationDays: data.durationDays,
    updatedAt: new Date(),
  })
}

export async function moveGoalForUser(
  templateId: string,
  goalId: string,
  userId: string,
  direction: 'up' | 'down',
): Promise<boolean> {
  const template = await queries.findByIdOwned(templateId, userId)
  if (!template) return false
  const index = template.goals.findIndex((goal) => goal.id === goalId)
  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (index < 0 || swapIndex < 0 || swapIndex >= template.goals.length) return false
  await queries.updateGoalPositions(templateId, [
    { id: template.goals[index].id, position: swapIndex },
    { id: template.goals[swapIndex].id, position: index },
  ])
  return true
}

export function archiveForUser(templateId: string, userId: string) {
  return queries.archive(templateId, userId)
}

function utcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}

function addInclusiveDuration(start: Date, durationDays: number): Date {
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + durationDays - 1)
  return end
}

export type ApplyTemplateResult =
  | { status: 'applied'; goalCount: number }
  | { status: 'duplicate' }
  | { status: 'empty' }
  | { status: 'not-found' }

export async function applyForUser(
  templateId: string,
  userId: string,
  data: TApplyLearningTemplate,
): Promise<ApplyTemplateResult> {
  const [template, learner, canContribute, existingGroups] = await Promise.all([
    queries.findByIdAccessible(templateId, userId),
    learnerQueries.findByIdForUser(data.learnerId, userId),
    learnerQueries.canContribute(data.learnerId, userId),
    goalQueries.findGroupsByLearnerId(data.learnerId),
  ])
  if (!template || !learner || !canContribute) return { status: 'not-found' }
  if (template.goals.length === 0) return { status: 'empty' }

  const duplicate = await queries.wasAppliedToLearner(templateId, data.learnerId)
  if (duplicate && !data.confirmDuplicate) return { status: 'duplicate' }

  const now = new Date()
  const startDate = utcDate(data.startDate)
  const goalGroupId = randomUUID()
  const createdGoals = template.goals.map((goal) => ({
    id: randomUUID(),
    learnerId: data.learnerId,
    groupId: goalGroupId,
    title: goal.title,
    description: goal.description,
    targetValue: goal.targetValue,
    unit: goal.unit,
    startDate,
    endDate: addInclusiveDuration(startDate, goal.durationDays),
    createdAt: now,
    updatedAt: now,
  }))
  const auditLogId = randomUUID()

  await queries.applyWithAudit({
    goalGroup: {
      id: goalGroupId,
      learnerId: data.learnerId,
      name: template.title,
      position: existingGroups.length,
      sourceTemplateId: template.id,
      sourceTemplateTitle: template.title,
      createdByUserId: userId,
      createdAt: now,
      updatedAt: now,
    },
    goals: createdGoals,
    auditLog: {
      id: auditLogId,
      actorId: userId,
      entityType: 'learning-template-application',
      entityId: templateId,
      createdAt: now,
    },
    templateAudit: {
      auditLogId,
      templateId,
      learnerId: data.learnerId,
      goalGroupId,
      createdGoalIds: createdGoals.map((goal) => goal.id),
      appliedStartDate: startDate,
    },
  })
  return { status: 'applied', goalCount: createdGoals.length }
}

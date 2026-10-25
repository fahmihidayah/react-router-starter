import { redirect } from 'react-router'
import { userContext } from '~/features/users/contexts'
import type { ActionArgs } from '~/lib/types'
import {
  applyLearningTemplateSchema,
  createLearningTemplateSchema,
  learningTemplateGoalSchema,
  updateLearningTemplateSchema,
} from '../schemas/form/learning-template-schema'
import * as service from '../services'

export type LearningTemplateActionFailure = {
  success: false
  operation: 'create' | 'update' | 'add-goal' | 'edit-goal' | 'apply'
  errors: Record<string, string[] | undefined>
  duplicate?: boolean
  goalId?: string
}

function userIdFrom(args: ActionArgs): string {
  const authSession = args.context.get(userContext)
  if (!authSession.user) throw new Response('Unauthorized', { status: 401 })
  return authSession.user.id
}

function values(formData: FormData) {
  return {
    title: formData.get('title'),
    visibility: formData.get('visibility'),
  }
}

export async function createLearningTemplateAction(
  args: ActionArgs,
): Promise<Response | LearningTemplateActionFailure> {
  const parsed = createLearningTemplateSchema.safeParse(values(await args.request.formData()))
  if (!parsed.success) {
    return { success: false, operation: 'create', errors: parsed.error.flatten().fieldErrors }
  }
  const template = await service.createForUser(parsed.data, userIdFrom(args))
  return redirect(`/track-app/learning-templates/${template.id}`)
}

export async function updateLearningTemplateAction(
  args: ActionArgs,
  templateId: string,
): Promise<Response | LearningTemplateActionFailure> {
  const parsed = updateLearningTemplateSchema.safeParse(values(await args.request.formData()))
  if (!parsed.success) {
    return { success: false, operation: 'update', errors: parsed.error.flatten().fieldErrors }
  }
  const updated = await service.updateForUser(templateId, userIdFrom(args), parsed.data)
  if (!updated) throw new Response('Template not found', { status: 404 })
  return redirect(`/track-app/learning-templates/${templateId}`)
}

export async function addLearningTemplateGoalAction(
  args: ActionArgs,
  templateId: string,
): Promise<Response | LearningTemplateActionFailure> {
  const formData = await args.request.formData()
  const parsed = learningTemplateGoalSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    targetValue: formData.get('targetValue'),
    unit: formData.get('unit'),
    durationDays: formData.get('durationDays'),
  })
  if (!parsed.success) {
    return { success: false, operation: 'add-goal', errors: parsed.error.flatten().fieldErrors }
  }
  const goal = await service.addGoalForUser(templateId, userIdFrom(args), parsed.data)
  if (!goal) throw new Response('Template not found', { status: 404 })
  return redirect(`/track-app/learning-templates/${templateId}`)
}

export async function deleteLearningTemplateGoalAction(
  args: ActionArgs,
  templateId: string,
  goalId: string,
): Promise<Response> {
  const deleted = await service.deleteGoalForUser(templateId, goalId, userIdFrom(args))
  if (!deleted) throw new Response('Template goal not found', { status: 404 })
  return redirect(`/track-app/learning-templates/${templateId}`)
}

export async function updateLearningTemplateGoalAction(
  args: ActionArgs,
  templateId: string,
  goalId: string,
): Promise<Response | LearningTemplateActionFailure> {
  const formData = await args.request.formData()
  const parsed = learningTemplateGoalSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    targetValue: formData.get('targetValue'),
    unit: formData.get('unit'),
    durationDays: formData.get('durationDays'),
  })
  if (!parsed.success) {
    return {
      success: false,
      operation: 'edit-goal',
      goalId,
      errors: parsed.error.flatten().fieldErrors,
    }
  }
  const goal = await service.updateGoalForUser(templateId, goalId, userIdFrom(args), parsed.data)
  if (!goal) throw new Response('Template goal not found', { status: 404 })
  return redirect(`/track-app/learning-templates/${templateId}`)
}

export async function moveLearningTemplateGoalAction(
  args: ActionArgs,
  templateId: string,
  goalId: string,
  direction: string,
): Promise<Response> {
  if (direction !== 'up' && direction !== 'down') {
    throw new Response('Invalid move direction', { status: 400 })
  }
  const moved = await service.moveGoalForUser(templateId, goalId, userIdFrom(args), direction)
  if (!moved) throw new Response('Template goal cannot be moved', { status: 400 })
  return redirect(`/track-app/learning-templates/${templateId}`)
}

export async function archiveLearningTemplateAction(
  args: ActionArgs,
  templateId: string,
): Promise<Response> {
  const archived = await service.archiveForUser(templateId, userIdFrom(args))
  if (!archived) throw new Response('Template not found', { status: 404 })
  return redirect('/track-app/learning-templates')
}

export async function applyLearningTemplateAction(
  args: ActionArgs,
  templateId: string,
): Promise<Response | LearningTemplateActionFailure> {
  const formData = await args.request.formData()
  const parsed = applyLearningTemplateSchema.safeParse({
    learnerId: formData.get('learnerId'),
    startDate: formData.get('startDate'),
    confirmDuplicate: formData.get('confirmDuplicate') === 'true',
  })
  if (!parsed.success) {
    return { success: false, operation: 'apply', errors: parsed.error.flatten().fieldErrors }
  }
  const result = await service.applyForUser(templateId, userIdFrom(args), parsed.data)
  if (result.status === 'not-found')
    throw new Response('Template or learner not found', { status: 404 })
  if (result.status === 'empty') {
    return {
      success: false,
      operation: 'apply',
      errors: { form: ['Add at least one goal before applying this template'] },
    }
  }
  if (result.status === 'duplicate') {
    return {
      success: false,
      operation: 'apply',
      duplicate: true,
      errors: { form: ['This template was already applied to the selected learner'] },
    }
  }
  return redirect(`/track-app/learners/${parsed.data.learnerId}?tab=goals`)
}

import { redirect } from 'react-router'
import { userContext } from '~/features/users/contexts'
import type { ActionArgs } from '~/lib/types'
import {
  createGoalSchema,
  goalGroupSchema,
  saveProgressEntrySchema,
} from '../schemas/form/goal-schema'
import * as goalService from '../services'

export type GoalActionFailure = {
  success: false
  scope: 'goal'
  operation: 'create' | 'entry' | 'create-group' | 'rename-group'
  entryMode?: 'manual' | 'pomodoro'
  goalId?: string
  groupId?: string
  errors: Record<string, string[] | undefined>
}

function userIdFrom(args: ActionArgs): string {
  const authSession = args.context.get(userContext)
  if (!authSession.user) throw new Response('Unauthorized', { status: 401 })
  return authSession.user.id
}

export async function createGoalAction(
  args: ActionArgs,
  learnerId: string,
): Promise<Response | GoalActionFailure> {
  const formData = await args.request.formData()
  const parsed = createGoalSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    targetValue: formData.get('targetValue'),
    unit: formData.get('unit'),
    startDate: formData.get('startDate'),
    durationValue: formData.get('durationValue'),
    durationUnit: formData.get('durationUnit'),
    groupId: formData.get('groupId'),
  })

  if (!parsed.success) {
    return {
      success: false,
      scope: 'goal',
      operation: 'create',
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const goal = await goalService.createForLearner(learnerId, userIdFrom(args), parsed.data)
  if (!goal) throw new Response('Learner not found', { status: 404 })
  return redirect(`/track-app/learners/${learnerId}?tab=goals`)
}

export async function createGoalGroupAction(
  args: ActionArgs,
  learnerId: string,
): Promise<Response | GoalActionFailure> {
  const formData = await args.request.formData()
  const parsed = goalGroupSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return {
      success: false,
      scope: 'goal',
      operation: 'create-group',
      errors: parsed.error.flatten().fieldErrors,
    }
  }
  const result = await goalService.createGroupForLearner(
    learnerId,
    userIdFrom(args),
    parsed.data.name,
  )
  if (!result) throw new Response('Learner not found or cannot be changed', { status: 404 })
  if (result === 'duplicate') {
    return {
      success: false,
      scope: 'goal',
      operation: 'create-group',
      errors: { name: ['A goal group with this name already exists'] },
    }
  }
  return redirect(`/track-app/learners/${learnerId}?tab=goals`)
}

export async function renameGoalGroupAction(
  args: ActionArgs,
  learnerId: string,
  groupId: string,
): Promise<Response | GoalActionFailure> {
  const formData = await args.request.formData()
  const parsed = goalGroupSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return {
      success: false,
      scope: 'goal',
      operation: 'rename-group',
      groupId,
      errors: parsed.error.flatten().fieldErrors,
    }
  }
  const result = await goalService.renameGroupForLearner(
    learnerId,
    userIdFrom(args),
    groupId,
    parsed.data.name,
  )
  if (!result) throw new Response('Goal group not found', { status: 404 })
  if (result === 'duplicate') {
    return {
      success: false,
      scope: 'goal',
      operation: 'rename-group',
      groupId,
      errors: { name: ['A goal group with this name already exists'] },
    }
  }
  return redirect(`/track-app/learners/${learnerId}?tab=goals`)
}

export async function deleteGoalGroupAction(
  args: ActionArgs,
  learnerId: string,
  groupId: string,
): Promise<Response> {
  const deleted = await goalService.deleteGroupForLearner(learnerId, userIdFrom(args), groupId)
  if (!deleted) throw new Response('Goal group not found', { status: 404 })
  return redirect(`/track-app/learners/${learnerId}?tab=goals`)
}

export async function moveGoalToGroupAction(
  args: ActionArgs,
  learnerId: string,
  goalId: string,
): Promise<Response> {
  const formData = await args.request.formData()
  const rawGroupId = formData.get('groupId')
  if (typeof rawGroupId !== 'string') throw new Response('Group ID is required', { status: 400 })
  const moved = await goalService.moveToGroupForLearner(
    learnerId,
    userIdFrom(args),
    goalId,
    rawGroupId || null,
  )
  if (!moved) throw new Response('Goal or group not found', { status: 404 })
  return redirect(`/track-app/learners/${learnerId}?tab=goals`)
}

export async function saveProgressEntryAction(
  args: ActionArgs,
  learnerId: string,
  goalId: string,
  redirectTo = `/track-app/learners/${learnerId}?tab=goals`,
): Promise<Response | GoalActionFailure> {
  const formData = await args.request.formData()
  const entryMode = formData.get('entryMode') === 'pomodoro' ? 'pomodoro' : 'manual'
  const parsed = saveProgressEntrySchema.safeParse({
    value: formData.get('value'),
    durationMinutes: formData.get('durationMinutes'),
    note: formData.get('note'),
    scheduleTodoId: formData.get('scheduleTodoId'),
    activityDate: formData.get('activityDate'),
  })

  if (!parsed.success) {
    return {
      success: false,
      scope: 'goal',
      operation: 'entry',
      entryMode,
      goalId,
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const entry = await goalService.saveEntryForLearner(
      learnerId,
      userIdFrom(args),
      goalId,
      parsed.data,
    )
    if (!entry) throw new Response('Goal not found', { status: 404 })
  } catch (error) {
    if (error instanceof RangeError) {
      return {
        success: false,
        scope: 'goal',
        operation: 'entry',
        entryMode,
        goalId,
        errors: { form: [error.message] },
      }
    }
    throw error
  }

  return redirect(redirectTo)
}

export async function deleteProgressEntryAction(
  args: ActionArgs,
  learnerId: string,
  goalId: string,
  entryId: string,
  redirectTo = `/track-app/learners/${learnerId}?tab=goals`,
): Promise<Response> {
  const deleted = await goalService.deleteEntryForLearner(
    learnerId,
    userIdFrom(args),
    goalId,
    entryId,
  )
  if (!deleted) throw new Response('Progress entry not found', { status: 404 })
  return redirect(redirectTo)
}

export async function deleteGoalAction(
  args: ActionArgs,
  learnerId: string,
  goalId: string,
): Promise<Response> {
  const deleted = await goalService.deleteForLearner(learnerId, userIdFrom(args), goalId)
  if (!deleted) throw new Response('Goal not found', { status: 404 })
  return redirect(`/track-app/learners/${learnerId}?tab=goals`)
}

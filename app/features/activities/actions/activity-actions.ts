import { redirect } from 'react-router'
import { userContext } from '~/features/users/contexts'
import type { ActionArgs } from '~/lib/types'
import * as m from '~/paraglide/messages.js'
import {
  createActivitySchema,
  createTrackSchema,
  renameTrackSchema,
} from '../schemas/form/activity-schema'
import * as activityService from '../services'

export type ActivityActionFailure = {
  success: false
  scope: 'activity'
  operation: 'create-activity' | 'create-track' | 'rename-track'
  entryMode?: 'manual' | 'pomodoro'
  trackId?: string
  errors: Record<string, string[] | undefined>
}

function userIdFrom(args: ActionArgs): string {
  const authSession = args.context.get(userContext)
  if (!authSession.user) throw new Response('Unauthorized', { status: 401 })
  return authSession.user.id
}

export async function createActivityAction(
  args: ActionArgs,
  learnerId: string,
  redirectTo = `/track-app/learners/${learnerId}?tab=activities`,
): Promise<Response | ActivityActionFailure> {
  const formData = await args.request.formData()
  const rawTrackId = formData.get('trackId')
  const entryMode = formData.get('entryMode') === 'pomodoro' ? 'pomodoro' : 'manual'
  const parsed = createActivitySchema.safeParse({
    title: formData.get('title'),
    activityDate: formData.get('activityDate'),
    durationMinutes: formData.get('durationMinutes'),
    value: formData.get('value'),
    unit: formData.get('unit'),
    trackId: rawTrackId,
    scheduleTodoId: formData.get('scheduleTodoId'),
    note: formData.get('note'),
  })
  if (!parsed.success) {
    return {
      success: false,
      scope: 'activity',
      operation: 'create-activity',
      entryMode,
      trackId: typeof rawTrackId === 'string' ? rawTrackId : undefined,
      errors: parsed.error.flatten().fieldErrors,
    }
  }
  const activity = await activityService.createForLearner(learnerId, userIdFrom(args), parsed.data)
  if (!activity) throw new Response('Learner or track not found', { status: 404 })
  return redirect(redirectTo)
}

export async function deleteActivityAction(
  args: ActionArgs,
  learnerId: string,
  activityId: string,
  redirectTo = `/track-app/learners/${learnerId}?tab=activities`,
): Promise<Response> {
  const deleted = await activityService.deleteForLearner(learnerId, userIdFrom(args), activityId)
  if (!deleted) throw new Response('Activity not found', { status: 404 })
  return redirect(redirectTo)
}

export async function createTrackAction(
  args: ActionArgs,
  learnerId: string,
): Promise<Response | ActivityActionFailure> {
  const formData = await args.request.formData()
  const parsed = createTrackSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return {
      success: false,
      scope: 'activity',
      operation: 'create-track',
      errors: parsed.error.flatten().fieldErrors,
    }
  }
  const track = await activityService.createTrackForLearner(
    learnerId,
    userIdFrom(args),
    parsed.data,
  )
  if (!track) throw new Response('Learner not found', { status: 404 })
  if (track === 'duplicate') {
    return {
      success: false,
      scope: 'activity',
      operation: 'create-track',
      errors: { name: [m.activity_error_topic_duplicate()] },
    }
  }
  return redirect(`/track-app/learners/${learnerId}?tab=activities`)
}

export async function renameTrackAction(
  args: ActionArgs,
  learnerId: string,
  trackId: string,
  redirectTo = `/track-app/learners/${learnerId}?tab=activities`,
): Promise<Response | ActivityActionFailure> {
  const formData = await args.request.formData()
  const parsed = renameTrackSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return {
      success: false,
      scope: 'activity',
      operation: 'rename-track',
      trackId,
      errors: parsed.error.flatten().fieldErrors,
    }
  }
  const track = await activityService.renameTrackForLearner(
    learnerId,
    userIdFrom(args),
    trackId,
    parsed.data,
  )
  if (!track) throw new Response('Track not found', { status: 404 })
  if (track === 'duplicate') {
    return {
      success: false,
      scope: 'activity',
      operation: 'rename-track',
      trackId,
      errors: { name: [m.activity_error_topic_duplicate()] },
    }
  }
  return redirect(redirectTo)
}

export async function archiveTrackAction(
  args: ActionArgs,
  learnerId: string,
  trackId: string,
): Promise<Response> {
  const archived = await activityService.archiveTrackForLearner(
    learnerId,
    userIdFrom(args),
    trackId,
  )
  if (!archived) throw new Response('Track not found', { status: 404 })
  return redirect(`/track-app/learners/${learnerId}?tab=activities`)
}

import { redirect } from 'react-router'
import { userContext } from '~/features/users/contexts'
import type { ActionArgs } from '~/lib/types'
import * as m from '~/paraglide/messages.js'
import {
  addScheduleTodoSchema,
  moveScheduleTodoSchema,
  saveSchedulePlanSchema,
} from '../schemas/form'
import * as scheduleService from '../services'

export type ScheduleActionFailure = {
  success: false
  scope: 'schedule'
  operation: 'add-todo' | 'edit-plan'
  errors: Record<string, string[] | undefined>
}

function userIdFrom(args: ActionArgs): string {
  const authSession = args.context.get(userContext)
  if (!authSession.user) throw new Response(m.schedule_error_unauthorized(), { status: 401 })
  return authSession.user.id
}

function scheduleUrl(learnerId: string, date: string, view = 'today'): string {
  const params = new URLSearchParams({ learnerId, date, view })
  return `/track-app/schedule?${params.toString()}`
}

function failure(
  operation: ScheduleActionFailure['operation'],
  message: string,
): ScheduleActionFailure {
  return { success: false, scope: 'schedule', operation, errors: { form: [message] } }
}

export async function saveSchedulePlanAction(
  args: ActionArgs,
  learnerId: string,
  date: string,
): Promise<Response | ScheduleActionFailure> {
  const formData = await args.request.formData()
  let items: unknown = []
  try {
    items = JSON.parse(String(formData.get('items') ?? '[]'))
  } catch {
    return failure('edit-plan', m.schedule_error_plan_invalid())
  }
  const parsed = saveSchedulePlanSchema.safeParse({
    startsOn: formData.get('startsOn'),
    timezone: formData.get('timezone'),
    items,
  })
  if (!parsed.success) {
    return {
      success: false,
      scope: 'schedule',
      operation: 'edit-plan',
      errors: parsed.error.flatten().fieldErrors,
    }
  }
  const result = await scheduleService.savePlanForLearner(learnerId, userIdFrom(args), parsed.data)
  if (result === 'forbidden') {
    throw new Response(m.schedule_error_forbidden(), { status: 403 })
  }
  if (result === 'invalid-source') return failure('edit-plan', m.schedule_error_source_invalid())
  if (result === 'duplicate-source') {
    return failure('edit-plan', m.schedule_error_source_duplicate())
  }
  return redirect(scheduleUrl(learnerId, date))
}

export async function addScheduleTodoAction(
  args: ActionArgs,
  learnerId: string,
): Promise<Response | ScheduleActionFailure> {
  const formData = await args.request.formData()
  const [sourceType, sourceId] = String(formData.get('source') ?? '').split(':')
  const parsed = addScheduleTodoSchema.safeParse({
    scheduledDate: formData.get('scheduledDate'),
    sourceType,
    sourceId,
    plannedDurationMinutes: formData.get('plannedDurationMinutes'),
  })
  if (!parsed.success) {
    return {
      success: false,
      scope: 'schedule',
      operation: 'add-todo',
      errors: parsed.error.flatten().fieldErrors,
    }
  }
  const result = await scheduleService.addTodoForLearner(learnerId, userIdFrom(args), parsed.data)
  if (result === 'forbidden') {
    throw new Response(m.schedule_error_forbidden(), { status: 403 })
  }
  if (result === 'invalid-source') return failure('add-todo', m.schedule_error_source_invalid())
  if (result === 'duplicate-source') {
    return failure('add-todo', m.schedule_error_source_duplicate_day())
  }
  return redirect(scheduleUrl(learnerId, parsed.data.scheduledDate))
}

export async function removeScheduleTodoAction(
  args: ActionArgs,
  learnerId: string,
  todoId: string,
  date: string,
  today: string,
): Promise<Response> {
  const result = await scheduleService.removeTodoForLearner(
    learnerId,
    userIdFrom(args),
    todoId,
    today,
  )
  if (result === 'forbidden') {
    throw new Response(m.schedule_error_forbidden(), { status: 403 })
  }
  if (result === 'not-found') {
    throw new Response(m.schedule_error_todo_not_found(), { status: 404 })
  }
  if (result === 'past') throw new Response(m.schedule_past_read_only(), { status: 400 })
  if (result === 'has-records') {
    throw new Response(m.schedule_error_completed_remove(), { status: 400 })
  }
  return redirect(scheduleUrl(learnerId, date))
}

export async function clearScheduleDayAction(
  args: ActionArgs,
  learnerId: string,
  date: string,
  today: string,
): Promise<Response> {
  const result = await scheduleService.clearDayForLearner(learnerId, userIdFrom(args), date, today)
  if (result === 'forbidden') {
    throw new Response(m.schedule_error_forbidden(), { status: 403 })
  }
  if (result === 'past') throw new Response(m.schedule_past_read_only(), { status: 400 })
  return redirect(scheduleUrl(learnerId, date))
}

export async function moveScheduleTodoAction(
  args: ActionArgs,
  learnerId: string,
  todoId: string,
  date: string,
  today: string,
): Promise<Response> {
  const formData = await args.request.formData()
  const parsed = moveScheduleTodoSchema.safeParse({ direction: formData.get('direction') })
  if (!parsed.success) {
    throw new Response(m.schedule_error_direction_invalid(), { status: 400 })
  }
  const result = await scheduleService.moveTodoForLearner(
    learnerId,
    userIdFrom(args),
    todoId,
    parsed.data.direction,
    today,
  )
  if (result === 'forbidden') {
    throw new Response(m.schedule_error_forbidden(), { status: 403 })
  }
  if (result === 'not-found') {
    throw new Response(m.schedule_error_todo_not_found(), { status: 404 })
  }
  if (result === 'past') throw new Response(m.schedule_past_read_only(), { status: 400 })
  return redirect(scheduleUrl(learnerId, date))
}

import z from 'zod'
import * as m from '~/paraglide/messages.js'
import { isDateKey } from '../../utils/date-range'

const sourceType = z.enum(['goal', 'activity_track'])
const dateKey = z.string().refine(isDateKey, m.schedule_error_date_invalid())

export const schedulePlanItemSchema = z.object({
  sourceType,
  sourceId: z.string().uuid(m.schedule_error_source_invalid()),
  plannedDurationMinutes: z.coerce
    .number()
    .int()
    .min(1, m.schedule_error_duration_min())
    .max(1440, m.schedule_error_duration_max()),
})

export const saveSchedulePlanSchema = z.object({
  startsOn: dateKey,
  timezone: z.string().trim().min(1).max(80),
  items: z.array(schedulePlanItemSchema).min(1, m.schedule_error_items_required()).max(100),
})

export const addScheduleTodoSchema = z.object({
  scheduledDate: dateKey,
  sourceType,
  sourceId: z.string().uuid(m.schedule_error_source_invalid()),
  plannedDurationMinutes: z.coerce
    .number()
    .int()
    .min(1, m.schedule_error_duration_min())
    .max(1440, m.schedule_error_duration_max()),
})

export const moveScheduleTodoSchema = z.object({
  direction: z.enum(['up', 'down']),
})

export type TSaveSchedulePlan = z.infer<typeof saveSchedulePlanSchema>
export type TAddScheduleTodo = z.infer<typeof addScheduleTodoSchema>

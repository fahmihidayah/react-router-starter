import z from 'zod'
import * as m from '~/paraglide/messages.js'
import { calculateGoalEndDate, goalDurationUnits, isGoalDateValue } from '../../utils/goal-duration'

const dateField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine(isGoalDateValue, `Enter a valid ${label.toLowerCase()}`)

export const createGoalSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Goal title is required')
      .max(120, 'Use 120 characters or less'),
    description: z.string().trim().max(500, 'Use 500 characters or less').optional(),
    targetValue: z.coerce.number().int().min(1, 'Target must be at least 1').max(1_000_000),
    unit: z.string().trim().min(1, 'Unit is required').max(30, 'Use 30 characters or less'),
    startDate: dateField('Start date'),
    durationValue: z.coerce.number().int().min(1, 'Duration must be at least 1'),
    durationUnit: z.enum(goalDurationUnits),
    groupId: z.preprocess(
      (value) => (value === '' || value === null ? undefined : value),
      z.string().trim().optional(),
    ),
  })
  .superRefine((data, context) => {
    const maximum = data.durationUnit === 'days' ? 3650 : 120
    if (data.durationValue > maximum) {
      context.addIssue({
        code: 'too_big',
        maximum,
        origin: 'number',
        inclusive: true,
        path: ['durationValue'],
        message: `Duration must be ${maximum} ${data.durationUnit} or less`,
      })
    }
  })
  .transform(({ durationValue, durationUnit, ...data }) => ({
    ...data,
    endDate: calculateGoalEndDate(data.startDate, durationValue, durationUnit),
  }))

export const saveProgressEntrySchema = z.object({
  value: z.coerce.number().int().min(1, 'Progress must be at least 1').max(1_000_000),
  durationMinutes: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce.number().int().min(1, 'Duration must be at least 1 minute').max(100_000).optional(),
  ),
  note: z.string().trim().max(500, 'Use 500 characters or less').optional(),
  scheduleTodoId: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.string().uuid().optional(),
  ),
  activityDate: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.string().refine(isGoalDateValue, m.schedule_error_date_invalid()).optional(),
  ),
})

export type TCreateGoal = z.infer<typeof createGoalSchema>
export type TSaveProgressEntry = z.infer<typeof saveProgressEntrySchema>

export const goalGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Group name is required')
    .max(80, 'Group name must be 80 characters or less'),
})

export type TGoalGroupInput = z.infer<typeof goalGroupSchema>

import z from 'zod'
import * as m from '~/paraglide/messages.js'

const dateField = z
  .string()
  .trim()
  .min(1, m.activity_error_date_required())
  .refine((value) => !Number.isNaN(Date.parse(value)), m.activity_error_date_invalid())

export const createActivitySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, m.activity_error_title_required())
      .max(160, m.activity_error_title_too_long()),
    activityDate: dateField,
    durationMinutes: z.preprocess(
      (value) => (value === '' || value === null ? undefined : value),
      z.coerce.number().int().min(1, m.activity_error_duration_min()).max(100_000).optional(),
    ),
    value: z.preprocess(
      (value) => (value === '' || value === null ? undefined : value),
      z.coerce.number().int().min(1, m.activity_error_amount_min()).max(1_000_000).optional(),
    ),
    unit: z.preprocess(
      (value) => (value === '' || value === null ? undefined : value),
      z.string().trim().max(30, m.activity_error_unit_too_long()).optional(),
    ),
    trackId: z.string().uuid(m.activity_error_topic_invalid()),
    scheduleTodoId: z.preprocess(
      (value) => (value === '' || value === null ? undefined : value),
      z.string().uuid().optional(),
    ),
    note: z.string().trim().max(1000, m.activity_error_note_too_long()).optional(),
  })
  .refine((data) => Boolean(data.value) === Boolean(data.unit), {
    path: ['unit'],
    message: m.activity_error_measurement_pair(),
  })

export const createTrackSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, m.activity_error_topic_name_required())
    .max(80, m.activity_error_topic_name_too_long()),
})

export const renameTrackSchema = createTrackSchema

export type TCreateActivity = z.infer<typeof createActivitySchema>
export type TCreateTrack = z.infer<typeof createTrackSchema>

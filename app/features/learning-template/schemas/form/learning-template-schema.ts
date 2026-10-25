import z from 'zod'

export const createLearningTemplateSchema = z.object({
  title: z.string().trim().min(1, 'Template title is required').max(120),
  visibility: z.enum(['private', 'public']).default('private'),
})

export const updateLearningTemplateSchema = createLearningTemplateSchema

export const learningTemplateGoalSchema = z.object({
  title: z.string().trim().min(1, 'Goal title is required').max(120),
  description: z.string().trim().max(500).optional(),
  targetValue: z.coerce.number().int().min(1).max(1_000_000),
  unit: z.string().trim().min(1, 'Unit is required').max(30),
  durationDays: z.coerce.number().int().min(1).max(3650),
})

export const applyLearningTemplateSchema = z.object({
  learnerId: z.string().uuid('Select a learner'),
  startDate: z
    .string()
    .trim()
    .min(1, 'Start date is required')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid start date'),
  confirmDuplicate: z.coerce.boolean().default(false),
})

export type TCreateLearningTemplate = z.infer<typeof createLearningTemplateSchema>
export type TLearningTemplateGoalInput = z.infer<typeof learningTemplateGoalSchema>
export type TApplyLearningTemplate = z.infer<typeof applyLearningTemplateSchema>

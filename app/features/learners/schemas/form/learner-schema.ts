import z from 'zod'

export const createLearnerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  dateOfBirth: z
    .string()
    .trim()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), 'Enter a valid date')
    .optional(),
  avatar: z.union([z.literal(''), z.url('Enter a valid avatar URL')]).optional(),
})

export type TCreateLearner = z.infer<typeof createLearnerSchema>

export const updateLearnerSchema = createLearnerSchema

export type TUpdateLearner = z.infer<typeof updateLearnerSchema>

export const learnerAccessRoles = ['parent', 'teacher', 'viewer'] as const

export const addLearnerAccessSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .transform((email) => email.toLowerCase()),
  role: z.enum(learnerAccessRoles, { error: 'Select a valid role' }),
})

export type TAddLearnerAccess = z.infer<typeof addLearnerAccessSchema>

export const learnerGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Group name is required')
    .max(80, 'Group name must be 80 characters or less'),
})

export type TLearnerGroupInput = z.infer<typeof learnerGroupSchema>

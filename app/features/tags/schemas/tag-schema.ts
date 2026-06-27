import z from 'zod'

export const createTagSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #FF5733)')
    .optional()
    .or(z.literal('')),
})

export type TCreateTag = z.infer<typeof createTagSchema>

export const updateTagSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #FF5733)')
    .optional()
    .or(z.literal('')),
})

export type TUpdateTag = z.infer<typeof updateTagSchema>

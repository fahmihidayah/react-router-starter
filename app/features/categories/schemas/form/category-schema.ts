import z from 'zod'

export const createCategorySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
})

export type TCreateCategory = z.infer<typeof createCategorySchema>

export const updateCategorySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
})

export type TUpdateCategory = z.infer<typeof updateCategorySchema>

import z from 'zod'

export const createCategorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
})

export type TCreateCategory = z.infer<typeof createCategorySchema>

export const updateCategorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
})

export type TUpdateCategory = z.infer<typeof updateCategorySchema>

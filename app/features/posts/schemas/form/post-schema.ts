import z from 'zod'

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less'),
  content: z.string().trim().min(1, 'Content is required'),
  categoryId: z.string().trim().min(1, 'Category is required'),
})

export type TCreatePost = z.infer<typeof createPostSchema>

export const updatePostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less'),
  content: z.string().trim().min(1, 'Content is required'),
  categoryId: z.string().trim().min(1, 'Category is required'),
})

export type TUpdatePost = z.infer<typeof updatePostSchema>

export const postFilterSchema = z.object({
  categoryId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

export type TPostFilter = z.infer<typeof postFilterSchema>

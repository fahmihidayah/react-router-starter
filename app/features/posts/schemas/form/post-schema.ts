import z from 'zod'

function hasContent(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const node = value as Record<string, unknown>
  if (node.type === 'image')
    return typeof node.src === 'string' && /^(https?:\/\/|\/(?!\/))/.test(node.src)
  if (node.type === 'text' || node.type === 'code-highlight')
    return typeof node.text === 'string' && node.text.trim().length > 0
  return Array.isArray(node.children) && node.children.some(hasContent)
}

const contentSchema = z
  .string()
  .trim()
  .min(1, 'Content is required')
  .refine((content) => {
    try {
      const parsed: unknown = JSON.parse(content)
      if (typeof parsed === 'string') return parsed.trim().length > 0
      return !!parsed && typeof parsed === 'object' && 'root' in parsed && hasContent(parsed.root)
    } catch {
      return content.length > 0
    }
  }, 'Add some text or an image to your post')

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less'),
  content: contentSchema,
  categoryId: z.string().trim().min(1, 'Category is required'),
})

export type TCreatePost = z.infer<typeof createPostSchema>

export const updatePostSchema = createPostSchema

export type TUpdatePost = z.infer<typeof updatePostSchema>

export const postFilterSchema = z.object({
  categoryId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

export type TPostFilter = z.infer<typeof postFilterSchema>

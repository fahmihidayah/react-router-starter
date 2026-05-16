import z from 'zod'

export const createMediaSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  alt: z.string().optional().nullable(),
  filename: z.string().min(1, 'Filename is required').max(255, 'Filename must be less than 255 characters'),
})

export type TCreateMedia = z.infer<typeof createMediaSchema>

export const updateMediaSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  alt: z.string().optional().nullable(),
  filename: z.string().min(1, 'Filename is required').max(255, 'Filename must be less than 255 characters'),
})

export type TUpdateMedia = z.infer<typeof updateMediaSchema>

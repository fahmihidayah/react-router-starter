import z from 'zod'

export const createMediaSchema = z.object({
  url: z.string().trim().min(1, 'URL is required'),
  alt: z.string().trim().optional().or(z.literal('')).nullable(),
  filename: z
    .string()
    .trim()
    .min(1, 'Filename is required')
    .max(255, 'Filename must be 255 characters or less'),
})

export type TCreateMedia = z.infer<typeof createMediaSchema>

export const updateMediaSchema = z.object({
  url: z.string().trim().min(1, 'URL is required'),
  alt: z.string().trim().optional().or(z.literal('')).nullable(),
  filename: z
    .string()
    .trim()
    .min(1, 'Filename is required')
    .max(255, 'Filename must be 255 characters or less'),
})

export type TUpdateMedia = z.infer<typeof updateMediaSchema>

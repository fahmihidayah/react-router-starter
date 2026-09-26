import z from 'zod'

export const createMediaSchema = z.object({
  alt: z.string().trim().optional().or(z.literal('')).nullable(),
})

export type TCreateMedia = z.infer<typeof createMediaSchema>

export const updateMediaSchema = z.object({
  alt: z.string().trim().optional().or(z.literal('')).nullable(),
})

export type TUpdateMedia = z.infer<typeof updateMediaSchema>

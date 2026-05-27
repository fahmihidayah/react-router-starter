import z from 'zod'

export const createCongregationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  gender: z.enum(['f', 'm'], {
    message: 'Gender must be either Male (m) or Female (f)',
  }),
  phone: z.string().min(1, 'Phone is required').max(20),
  address: z.string().min(1, 'Address is required'),
  tagIds: z.string().optional(),
})

export type TCreateCongregation = z.infer<typeof createCongregationSchema>

export const updateCongregationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  gender: z.enum(['f', 'm'], {
    message: 'Gender must be either Male (m) or Female (f)',
  }),
  phone: z.string().min(1, 'Phone is required').max(20),
  address: z.string().min(1, 'Address is required'),
  tagIds: z.string().optional(),
})

export type TUpdateCongregation = z.infer<typeof updateCongregationSchema>

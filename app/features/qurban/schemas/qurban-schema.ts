import z from 'zod'

export const createQurbanSchema = z.object({
  transactionId: z.string().min(1, 'Transaction is required'),
  animalType: z.enum(['goat', 'sheep', 'cow', 'camel'], {
    message: 'Animal type is required',
  }),
  groupNumber: z.number().int().positive().optional(),
  hijriYear: z.number().int().positive('Hijri year is required'),
  notes: z.string().optional(),
})

export type TCreateQurban = z.infer<typeof createQurbanSchema>

export const updateQurbanSchema = z.object({
  transactionId: z.string().min(1, 'Transaction is required'),
  animalType: z.enum(['goat', 'sheep', 'cow', 'camel'], {
    message: 'Animal type is required',
  }),
  groupNumber: z.number().int().positive().optional(),
  hijriYear: z.number().int().positive('Hijri year is required'),
  notes: z.string().optional(),
})

export type TUpdateQurban = z.infer<typeof updateQurbanSchema>

import z from 'zod'

export const createTransactionSchema = z.object({
  congregationId: z.string().min(1, 'Congregation is required'),
  amount: z.number().int().positive('Amount must be a positive number'),
  paymentMethod: z.enum(['cash', 'transfer', 'card'], {
    message: 'Payment method is required',
  }),
  status: z.enum(['pending', 'completed', 'failed', 'refunded'], {
    message: 'Status is required',
  }),
  notes: z.string().optional(),
  transactionDate: z.string().min(1, 'Transaction date is required'),
})

export type TCreateTransaction = z.infer<typeof createTransactionSchema>

export const updateTransactionSchema = z.object({
  congregationId: z.string().min(1, 'Congregation is required'),
  amount: z.number().int().positive('Amount must be a positive number'),
  paymentMethod: z.enum(['cash', 'transfer', 'card'], {
    message: 'Payment method is required',
  }),
  status: z.enum(['pending', 'completed', 'failed', 'refunded'], {
    message: 'Status is required',
  }),
  notes: z.string().optional(),
  transactionDate: z.string().min(1, 'Transaction date is required'),
})

export type TUpdateTransaction = z.infer<typeof updateTransactionSchema>

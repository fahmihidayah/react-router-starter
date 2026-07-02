import z from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})

export type TLogin = z.infer<typeof loginSchema>

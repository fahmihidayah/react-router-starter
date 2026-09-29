import z from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  roleId: z.string().min(1, 'Role is required'),
})

export type TCreateUser = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email'),
})

export type TUpdateUser = z.infer<typeof updateUserSchema>

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  roleId: z.string().min(1, 'Role is required'),
})

export const registerUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
})

export type TRegisterUser = z.infer<typeof registerUserSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
})

export type TForgotPassword = z.infer<typeof forgotPasswordSchema>

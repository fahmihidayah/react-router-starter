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

type UpdateUserValidationMessages = {
  nameRequired: string
  nameMax: string
  emailInvalid: string
}

const defaultUpdateUserValidationMessages: UpdateUserValidationMessages = {
  nameRequired: 'Name is required',
  nameMax: 'Name must be less than 100 characters',
  emailInvalid: 'Invalid email',
}

export function createUpdateUserSchema(
  messages: UpdateUserValidationMessages = defaultUpdateUserValidationMessages,
) {
  return z.object({
    name: z.string().min(1, messages.nameRequired).max(100, messages.nameMax),
    email: z.string().email(messages.emailInvalid),
  })
}

export const updateUserSchema = createUpdateUserSchema()

export type TUpdateUser = z.infer<typeof updateUserSchema>

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  roleId: z.string().min(1, 'Role is required'),
})

type RegisterValidationMessages = {
  nameRequired: string
  nameMax: string
  emailInvalid: string
  passwordMin: string
  passwordMax: string
}

const defaultRegisterValidationMessages: RegisterValidationMessages = {
  nameRequired: 'Name is required',
  nameMax: 'Name must be less than 50 characters',
  emailInvalid: 'Please enter a valid email address',
  passwordMin: 'Password must be at least 8 characters',
  passwordMax: 'Password must be less than 128 characters',
}

export function createRegisterUserSchema(
  messages: RegisterValidationMessages = defaultRegisterValidationMessages,
) {
  return z.object({
    name: z.string().trim().min(1, messages.nameRequired).max(50, messages.nameMax),
    email: z.string().trim().email(messages.emailInvalid),
    password: z.string().min(8, messages.passwordMin).max(128, messages.passwordMax),
  })
}

export const registerUserSchema = createRegisterUserSchema()

export type TRegisterUser = z.infer<typeof registerUserSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
})

export type TForgotPassword = z.infer<typeof forgotPasswordSchema>

import z from 'zod'

const roleFields = {
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  description: z
    .string()
    .trim()
    .max(255, 'Description must be 255 characters or less')
    .transform((value) => value || null),
}

export const createRoleSchema = z.object(roleFields)
export const updateRoleSchema = z.object(roleFields)

export type TCreateRole = z.infer<typeof createRoleSchema>
export type TUpdateRole = z.infer<typeof updateRoleSchema>

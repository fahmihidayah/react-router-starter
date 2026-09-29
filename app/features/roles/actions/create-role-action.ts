import { redirect } from 'react-router'
import type { ActionArgs } from '~/lib/types'
import { createRoleSchema } from '../schemas/form/role-schema'
import * as roleService from '../services'
import { RoleAlreadyExistsError } from '../types/errors'

export async function createRoleAction(args: ActionArgs) {
  const result = createRoleSchema.safeParse(Object.fromEntries(await args.request.formData()))
  if (!result.success) return { errors: result.error.flatten().fieldErrors }

  try {
    await roleService.create(result.data)
    return redirect('/admin/roles')
  } catch (error) {
    return {
      errors: {
        name: [
          error instanceof RoleAlreadyExistsError
            ? error.message
            : 'An unexpected error occurred. Please try again.',
        ],
      },
    }
  }
}

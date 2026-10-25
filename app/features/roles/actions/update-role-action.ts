import { redirect } from 'react-router'
import type { ActionArgs } from '~/lib/types'
import { updateRoleSchema } from '../schemas/form/role-schema'
import * as roleService from '../services'
import { RoleAlreadyExistsError, RoleNotFoundError } from '../types/errors'

export async function updateRoleAction(args: ActionArgs) {
  const id = args.params.id
  if (!id) throw new Response('Role ID is required', { status: 400 })

  const result = updateRoleSchema.safeParse(Object.fromEntries(await args.request.formData()))
  if (!result.success) return { errors: result.error.flatten().fieldErrors }

  try {
    await roleService.update(id, result.data)
    return redirect('/admin/roles')
  } catch (error) {
    if (error instanceof RoleNotFoundError) throw new Response(error.message, { status: 404 })
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

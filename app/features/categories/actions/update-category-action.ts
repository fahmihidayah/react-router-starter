import { redirect } from 'react-router'
import type { ActionArgs } from '~/lib/types'
import { updateCategorySchema } from '../schemas/form/category-schema'
import * as categoryService from '../services'
import { CategoryAlreadyExistsError, CategoryNotFoundError } from '../types/errors/category-errors'

export async function updateCategoryAction(args: ActionArgs) {
  const id = args.params.id
  if (!id) {
    throw new Response('Category ID is required', { status: 400 })
  }

  const formData = await args.request.formData()
  const result = updateCategorySchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    await categoryService.update(id, result.data)
    return redirect('/admin/categories')
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      throw new Response(error.message, { status: 404 })
    }

    if (error instanceof CategoryAlreadyExistsError) {
      return {
        errors: {
          title: [error.message],
        },
      }
    }

    return {
      errors: {
        title: ['An unexpected error occurred. Please try again.'],
      },
    }
  }
}

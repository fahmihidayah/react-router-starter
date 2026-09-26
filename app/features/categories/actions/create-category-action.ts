import { redirect } from 'react-router'
import type { ActionArgs } from '~/lib/types'
import { createCategorySchema } from '../schemas/form/category-schema'
import * as categoryService from '../services'
import {
  CategoryAlreadyExistsError,
  CategoryCreationFailedError,
  InvalidCategoryDataError,
} from '../types/errors/category-errors'

export async function createCategoryAction(args: ActionArgs) {
  const formData = await args.request.formData()
  const result = createCategorySchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    await categoryService.create(result.data)
    return redirect('/admin/categories')
  } catch (error) {
    if (error instanceof CategoryAlreadyExistsError) {
      return {
        errors: {
          title: [error.message],
        },
      }
    }

    if (error instanceof InvalidCategoryDataError) {
      return {
        errors: {
          title: [error.message],
        },
      }
    }

    if (error instanceof CategoryCreationFailedError) {
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

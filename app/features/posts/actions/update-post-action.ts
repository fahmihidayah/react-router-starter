import { redirect } from 'react-router'
import { updatePostSchema } from '../schemas/form/post-schema'
import * as postService from '../services'
import {
  PostNotFoundError,
  PostUpdateFailedError,
  SlugAlreadyExistsError,
} from '../types/errors/post-errors'

export async function updatePostAction(request: Request, id: string) {
  const formData = await request.formData()
  const rawData = Object.fromEntries(formData)

  const result = updatePostSchema.safeParse(rawData)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    await postService.update(id, result.data)
    return redirect('/admin/posts')
  } catch (error) {
    if (error instanceof PostNotFoundError) {
      return {
        errors: {
          title: [error.message],
          content: [],
          categoryId: [],
        },
      }
    }

    if (error instanceof SlugAlreadyExistsError) {
      return {
        errors: {
          title: [error.message],
          content: [],
          categoryId: [],
        },
      }
    }

    if (error instanceof PostUpdateFailedError) {
      return {
        errors: {
          title: [error.message],
          content: [],
          categoryId: [],
        },
      }
    }

    return {
      errors: {
        title: ['Failed to update post. Please try again.'],
        content: [],
        categoryId: [],
      },
    }
  }
}

import { redirect } from 'react-router'
import { createPostSchema } from '../schemas/form/post-schema'
import * as postService from '../services'
import { PostCreationFailedError, SlugAlreadyExistsError } from '../types/errors/post-errors'

export async function createPostAction(request: Request) {
  const formData = await request.formData()
  const rawData = Object.fromEntries(formData)

  const result = createPostSchema.safeParse(rawData)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    await postService.create(result.data)
    return redirect('/admin/posts')
  } catch (error) {
    if (error instanceof SlugAlreadyExistsError) {
      return {
        errors: {
          title: [error.message],
          content: [],
          categoryId: [],
        },
      }
    }

    if (error instanceof PostCreationFailedError) {
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
        title: ['Failed to create post. Please try again.'],
        content: [],
        categoryId: [],
      },
    }
  }
}

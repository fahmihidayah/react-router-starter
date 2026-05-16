import { redirect } from 'react-router'
import { postRepository } from '../repositories'
import { updatePostSchema } from '../schemas/post-schema'
import { createSlugFrom } from '~/utils/slug'

export async function updatePostAction(request: Request, id: string) {
  const formData = await request.formData()
  const result = updatePostSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { title, content, categoryId } = result.data
    const slug = createSlugFrom(title)

    // Get the current post to check slug changes
    const currentPost = await postRepository.findById(id)
    if (!currentPost) {
      return {
        errors: {
          title: ['Post not found'],
        },
      }
    }

    // Check if new slug is different and already exists
    if (slug !== currentPost.slug) {
      const exists = await postRepository.slugExists(slug)
      if (exists) {
        return {
          errors: {
            title: ['A post with this title already exists'],
          },
        }
      }
    }

    await postRepository.update(id, {
      slug,
      title,
      content,
      categoryId,
      updatedAt: new Date(),
    })

    return redirect('/dashboard/posts')
  } catch (_error) {
    return {
      errors: {
        title: ['Failed to update post. Please try again.'],
      },
    }
  }
}

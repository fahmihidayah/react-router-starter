import { randomUUID } from 'node:crypto'
import { redirect } from 'react-router'
import { postRepository } from '../repositories'
import { createPostSchema } from '../schemas/post-schema'
import { createSlugFrom } from '~/utils/slug'

export async function createPostAction(request: Request) {
  const formData = await request.formData()
  const result = createPostSchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { title, content, categoryId } = result.data
    const slug = createSlugFrom(title)
    console.log("log for create post action :", JSON.stringify(formData));
    
    
    // Check if slug already exists
    const exists = await postRepository.slugExists(slug)
    if (exists) {
      return {
        errors: {
          title: ['A post with this title already exists'],
        },
      }
    }

    const now = new Date()

    await postRepository.create({
      id: randomUUID(),
      slug,
      title,
      content,
      categoryId,
      createdAt: now,
      updatedAt: now,
    })

    return redirect('/dashboard/posts')
  } catch (_error) {
    return {
      errors: {
        title: ['Failed to create post. Please try again.'],
      },
    }
  }
}

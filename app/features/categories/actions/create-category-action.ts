import { randomUUID } from 'node:crypto'
import { redirect } from 'react-router'
import { categoryRepository } from '../repositories'
import { createCategorySchema } from '../schemas/category-schema'

export async function createCategoryAction(request: Request) {
  const formData = await request.formData()
  const result = createCategorySchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { title } = result.data
    const now = new Date()

    await categoryRepository.create({
      id: randomUUID(),
      title,
      createdAt: now,
      updatedAt: now,
    })

    return redirect('/dashboard/categories')
  } catch (_error) {
    return {
      errors: {
        title: ['Failed to create category. Please try again.'],
      },
    }
  }
}

import { redirect } from 'react-router'
import { categoryRepository } from '../repositories'
import { updateCategorySchema } from '../schemas/category-schema'

export async function updateCategoryAction(request: Request, id: string) {
  const formData = await request.formData()
  const result = updateCategorySchema.safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { title } = result.data

    await categoryRepository.update(id, {
      title,
      updatedAt: new Date(),
    })

    return redirect('/dashboard/categories')
  } catch (_error) {
    return {
      errors: {
        title: ['Failed to update category. Please try again.'],
      },
    }
  }
}

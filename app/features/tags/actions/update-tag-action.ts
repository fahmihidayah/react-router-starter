import { redirect } from 'react-router'
import { tagRepository } from '../repositories'
import { updateTagSchema } from '../schemas/tag-schema'

export async function updateTagAction(request: Request, id: string) {
  const formData = await request.formData()
  const rawData = Object.fromEntries(formData)

  const result = updateTagSchema.safeParse(rawData)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { name, color } = result.data

    await tagRepository.update(id, {
      name,
      color: color || null,
      updatedAt: new Date(),
    })

    return redirect('/dashboard/tags')
  } catch (_error) {
    return {
      errors: {
        name: ['Failed to update tag. Please try again.'],
        color: [],
      },
    }
  }
}

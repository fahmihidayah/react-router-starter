import { randomUUID } from 'node:crypto'
import { redirect } from 'react-router'
import { tagRepository } from '../repositories'
import { createTagSchema } from '../schemas/tag-schema'

export async function createTagAction(request: Request) {
  const formData = await request.formData()
  const rawData = Object.fromEntries(formData)

  const result = createTagSchema.safeParse(rawData)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { name, color } = result.data

    const now = new Date()

    await tagRepository.create({
      id: randomUUID(),
      name,
      color: color || null,
      createdAt: now,
      updatedAt: now,
    })

    return redirect('/dashboard/tags')
  } catch (_error) {
    return {
      errors: {
        name: ['Failed to create tag. Please try again.'],
        color: [],
      },
    }
  }
}

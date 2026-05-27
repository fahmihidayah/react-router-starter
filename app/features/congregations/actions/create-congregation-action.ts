import { randomUUID } from 'node:crypto'
import { redirect } from 'react-router'
import { db } from '~/lib/database'
import { congregationTags } from '~/db/schema'
import { congregationRepository } from '../repositories'
import { createCongregationSchema } from '../schemas/congregation-schema'

export async function createCongregationAction(request: Request) {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  const result = createCongregationSchema.safeParse(data)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { name, gender, phone, address, tagIds } = result.data

    const now = new Date()
    const congregationId = randomUUID()

    await congregationRepository.create({
      id: congregationId,
      name,
      gender,
      phone,
      address,
      createdAt: now,
      updatedAt: now,
    })

    // Insert congregation tag if selected
    if (tagIds) {
      await db.insert(congregationTags).values({
        congregationId,
        tagId: tagIds,
      })
    }

    return redirect('/dashboard/congregations')
  } catch (_error) {
    return {
      errors: {
        name: ['Failed to create congregation. Please try again.'],
        gender: [],
        phone: [],
        address: [],
      },
    }
  }
}

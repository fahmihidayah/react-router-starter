import { eq } from 'drizzle-orm'
import { redirect } from 'react-router'
import { db } from '~/lib/database'
import { congregationTags } from '~/db/schema'
import { congregationRepository } from '../repositories'
import { updateCongregationSchema } from '../schemas/congregation-schema'

export async function updateCongregationAction(request: Request, id: string) {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  const result = updateCongregationSchema.safeParse(data)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { name, gender, phone, address, tagIds } = result.data

    await congregationRepository.update(id, {
      name,
      gender,
      phone,
      address,
      updatedAt: new Date(),
    })

    // Delete existing congregation tags
    await db.delete(congregationTags).where(eq(congregationTags.congregationId, id))

    // Insert new congregation tag if selected
    if (tagIds) {
      await db.insert(congregationTags).values({
        congregationId: id,
        tagId: tagIds,
      })
    }

    return redirect('/dashboard/congregations')
  } catch (_error) {
    return {
      errors: {
        name: ['Failed to update congregation. Please try again.'],
        gender: [],
        phone: [],
        address: [],
      },
    }
  }
}

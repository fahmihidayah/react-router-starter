import { redirect } from 'react-router'
import { qurbanRepository } from '../repositories'
import { updateQurbanSchema } from '../schemas/qurban-schema'

export async function updateQurbanAction(request: Request, id: string) {
  const formData = await request.formData()
  const rawData = Object.fromEntries(formData)

  // Convert numbers if they're strings
  const parsedData = {
    ...rawData,
    groupNumber: rawData.groupNumber ? Number(rawData.groupNumber) : undefined,
    hijriYear: rawData.hijriYear ? Number(rawData.hijriYear) : undefined,
  }

  const result = updateQurbanSchema.safeParse(parsedData)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { transactionId, animalType, groupNumber, hijriYear, notes } = result.data

    await qurbanRepository.update(id, {
      transactionId,
      animalType,
      groupNumber: groupNumber || null,
      hijriYear,
      notes: notes || null,
      updatedAt: new Date(),
    })

    return redirect('/dashboard/qurban')
  } catch (_error) {
    return {
      errors: {
        transactionId: ['Failed to update qurban. Please try again.'],
        animalType: [],
        groupNumber: [],
        hijriYear: [],
        notes: [],
      },
    }
  }
}

import { randomUUID } from 'node:crypto'
import { redirect } from 'react-router'
import { qurbanRepository } from '../repositories'
import { createQurbanSchema } from '../schemas/qurban-schema'

export async function createQurbanAction(request: Request) {
  const formData = await request.formData()
  const rawData = Object.fromEntries(formData)

  // Convert numbers if they're strings
  const parsedData = {
    ...rawData,
    groupNumber: rawData.groupNumber ? Number(rawData.groupNumber) : undefined,
    hijriYear: rawData.hijriYear ? Number(rawData.hijriYear) : undefined,
  }

  const result = createQurbanSchema.safeParse(parsedData)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { transactionId, animalType, groupNumber, hijriYear, notes } = result.data

    const now = new Date()

    await qurbanRepository.create({
      id: randomUUID(),
      transactionId,
      animalType,
      groupNumber: groupNumber || null,
      hijriYear,
      notes: notes || null,
      createdAt: now,
      updatedAt: now,
    })

    return redirect('/dashboard/qurban')
  } catch (_error) {
    return {
      errors: {
        transactionId: ['Failed to create qurban. Please try again.'],
        animalType: [],
        groupNumber: [],
        hijriYear: [],
        notes: [],
      },
    }
  }
}

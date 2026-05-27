import { randomUUID } from 'node:crypto'
import { redirect } from 'react-router'
import { eventRepository } from '../repositories'
import { createEventSchema } from '../schemas/event-schema'

export async function createEventAction(request: Request) {
  const formData = await request.formData()
  const rawData = Object.fromEntries(formData)

  const result = createEventSchema.safeParse(rawData)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { name, description, eventDate, location, status } = result.data

    const now = new Date()

    await eventRepository.create({
      id: randomUUID(),
      name,
      description: description || null,
      eventDate: new Date(eventDate),
      location: location || null,
      status,
      createdAt: now,
      updatedAt: now,
    })

    return redirect('/dashboard/events')
  } catch (_error) {
    return {
      errors: {
        name: ['Failed to create event. Please try again.'],
        description: [],
        eventDate: [],
        location: [],
        status: [],
      },
    }
  }
}

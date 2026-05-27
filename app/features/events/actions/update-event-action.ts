import { redirect } from 'react-router'
import { eventRepository } from '../repositories'
import { updateEventSchema } from '../schemas/event-schema'

export async function updateEventAction(request: Request, id: string) {
  const formData = await request.formData()
  const rawData = Object.fromEntries(formData)

  const result = updateEventSchema.safeParse(rawData)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors }
  }

  try {
    const { name, description, eventDate, location, status } = result.data

    await eventRepository.update(id, {
      name,
      description: description || null,
      eventDate: new Date(eventDate),
      location: location || null,
      status,
      updatedAt: new Date(),
    })

    return redirect('/dashboard/events')
  } catch (_error) {
    return {
      errors: {
        name: ['Failed to update event. Please try again.'],
        description: [],
        eventDate: [],
        location: [],
        status: [],
      },
    }
  }
}

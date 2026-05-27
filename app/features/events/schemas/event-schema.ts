import z from 'zod'

export const createEventSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  eventDate: z.string().min(1, 'Event date is required'),
  location: z.string().max(200).optional(),
  status: z.enum(['planned', 'ongoing', 'completed', 'cancelled'], {
    message: 'Status is required',
  }),
})

export type TCreateEvent = z.infer<typeof createEventSchema>

export const updateEventSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  eventDate: z.string().min(1, 'Event date is required'),
  location: z.string().max(200).optional(),
  status: z.enum(['planned', 'ongoing', 'completed', 'cancelled'], {
    message: 'Status is required',
  }),
})

export type TUpdateEvent = z.infer<typeof updateEventSchema>

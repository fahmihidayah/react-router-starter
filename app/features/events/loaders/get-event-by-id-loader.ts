import { eventRepository } from '../repositories'

export async function getEventByIdLoader(id: string) {
  return eventRepository.findById(id)
}

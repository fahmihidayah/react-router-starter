import { tagRepository } from '../repositories'

export async function getTagByIdLoader(id: string) {
  return tagRepository.findById(id)
}

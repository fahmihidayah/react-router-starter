import type { TTag } from '~/db/schema'
import { tagRepository } from '../repositories'

export async function getAllTagsLoader(): Promise<TTag[]> {
  const result = await tagRepository.findMany()
  return result
}

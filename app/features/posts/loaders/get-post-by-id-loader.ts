import { postRepository } from '../repositories'

export async function getPostByIdLoader(id: string) {
  return postRepository.findById(id)
}

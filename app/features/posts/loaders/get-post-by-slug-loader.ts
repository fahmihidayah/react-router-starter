import { postRepository } from '../repositories'

export async function getPostBySlugLoader(slug: string) {
  return postRepository.findBySlug(slug)
}

import * as postService from '../services'

export async function getPostBySlugLoader(slug: string) {
  return postService.findBySlug(slug)
}

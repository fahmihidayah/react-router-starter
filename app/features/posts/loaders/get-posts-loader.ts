import { postRepository } from '../repositories'
import type { TPostFilter } from '../schemas/post-schema'

export async function getPostsLoader(request: Request) {
  const url = new URL(request.url)
  const page = Number.parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10)
  const search = url.searchParams.get('search') || ''
  const categoryId = url.searchParams.get('categoryId') || ''

  const filter: Partial<TPostFilter> = {
    page,
    limit,
    ...(search && { search }),
    ...(categoryId && { categoryId }),
  }

  return postRepository.findWithFilter(filter)
}

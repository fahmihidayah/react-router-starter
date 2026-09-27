import * as postService from '../services'

export async function getPostsLoader(request: Request) {
  const url = new URL(request.url)
  const page = positiveInteger(url.searchParams.get('page'), 1)
  const limit = Math.min(100, positiveInteger(url.searchParams.get('limit'), 10))
  const search = url.searchParams.get('search') || ''
  const categoryId = url.searchParams.get('categoryId') || ''

  return postService.findPaginated({
    page,
    limit,
    ...(search && { search }),
    ...(categoryId && { categoryId }),
  })
}

function positiveInteger(value: string | null, fallback: number) {
  const number = Number(value)
  return Number.isSafeInteger(number) && number > 0 ? number : fallback
}

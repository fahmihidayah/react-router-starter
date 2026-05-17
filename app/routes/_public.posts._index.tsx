import { useLoaderData } from 'react-router'
import { ListPostsPage } from '~/features/posts/components/list-posts-page'
import { getPostsLoader } from '~/features/posts/loaders/get-posts-loader'
import type { Route } from './+types/_public.posts._index'

export async function loader({ request }: Route.LoaderArgs) {
  return await getPostsLoader(request)
}

export function meta() {
  return [{ title: 'Posts' }, { name: 'description', content: 'Read our latest blog posts' }]
}

export default function PostsPage() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Posts</h1>
        <p className="mt-2 text-muted-foreground">Explore our latest articles and insights</p>
      </div>

      <ListPostsPage
        posts={loaderData.docs}
        currentPage={loaderData.page}
        totalPages={loaderData.totalPages}
      />
    </div>
  )
}

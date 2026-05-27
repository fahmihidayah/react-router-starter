import { ArrowLeftIcon } from 'lucide-react'
import { useLoaderData, useNavigate } from 'react-router'
import { RichEditorViewer } from '~/components/ui/rich-editor-viewer'
import { getPostBySlugLoader } from '~/features/posts/loaders/get-post-by-slug-loader'
import { formatDate } from '~/lib/utils'

export async function loader({ params }: { params: { slug: string } }) {
  const post = await getPostBySlugLoader(params.slug)
  if (!post) {
    throw new Response('Post not found', { status: 404 })
  }
  return post
}

export function meta({ data }: { data: any }) {
  return [
    { title: `${data?.title || 'Post'} - Blog` },
    { name: 'description', content: data?.content ? data.content.substring(0, 160) : '' },
  ]
}

export default function PostDetailPage() {
  const post = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => navigate('/posts')}
        className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="size-4" />
        Back to posts
      </button>

      <article className="flex flex-col gap-4 w-full">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <time dateTime={post.createdAt.toISOString()}>{formatDate(post.createdAt)}</time>
          {post.updatedAt.getTime() !== post.createdAt.getTime() && (
            <>
              <span>•</span>
              <span>Updated {formatDate(post.updatedAt)}</span>
            </>
          )}
        </div>
        <hr></hr>
        <RichEditorViewer content={post.content} />
      </article>
    </div>
  )
}

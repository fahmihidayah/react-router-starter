import { useActionData, useLoaderData } from 'react-router'
import { updatePostAction } from '~/features/posts/actions/update-post-action'
import { EditPostForm } from '~/features/posts/components/admin/form/edit-post-form'
import { getPostByIdLoader } from '~/features/posts/loaders/get-post-by-id-loader'
import { getPostCategoriesLoader } from '~/features/posts/loaders/get-post-categories-loader'
import type { Route } from './+types/posts.$id'

export async function loader({ params }: Route.LoaderArgs) {
  const [post, categories] = await Promise.all([
    getPostByIdLoader(params.id),
    getPostCategoriesLoader(),
  ])
  if (!post) throw new Response('Post not found', { status: 404 })
  return { post, categories }
}
export function action({ request, params }: Route.ActionArgs) {
  return updatePostAction(request, params.id)
}
export function meta() {
  return [{ title: 'Edit Post - Dashboard' }]
}
export default function EditPostPage() {
  const { post, categories } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-6">
      <h1 className="text-2xl font-semibold">Edit post</h1>
      <EditPostForm post={post} categories={categories} errors={actionData?.errors} />
    </div>
  )
}

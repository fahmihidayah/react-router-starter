import { useActionData, useLoaderData } from 'react-router'
import { createPostAction } from '~/features/posts/actions/create-post-action'
import { NewPostForm } from '~/features/posts/components/admin/form/new-post-form'
import { getPostCategoriesLoader } from '~/features/posts/loaders/get-post-categories-loader'
import type { Route } from './+types/posts.new'

export function loader() {
  return getPostCategoriesLoader()
}
export function action({ request }: Route.ActionArgs) {
  return createPostAction(request)
}
export function meta() {
  return [{ title: 'Add Post - Dashboard' }]
}

export default function NewPostPage() {
  const categories = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-6">
      <h1 className="text-2xl font-semibold">Add post</h1>
      <NewPostForm categories={categories} errors={actionData?.errors} />
    </div>
  )
}

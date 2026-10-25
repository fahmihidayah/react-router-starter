import { useActionData, useLoaderData } from 'react-router'
import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import { createPostAction } from '~/features/posts/actions/create-post-action'
import { NewPostForm } from '~/features/posts/components/admin/form/new-post-form'
import { getPostCategoriesLoader } from '~/features/posts/loaders/get-post-categories-loader'
import type { Route } from './+types/posts.new'

export const middleware: Route.MiddlewareFunction[] = [
  enforceRoutePermissions({
    action: PERMISSION_KEYS.POSTS_CREATE,
    loader: { allOf: [PERMISSION_KEYS.POSTS_CREATE, PERMISSION_KEYS.CATEGORIES_READ] },
  }),
]

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
    <div className="w-full space-y-5 p-6">
      <h1 className="text-2xl font-semibold">Add post</h1>
      <NewPostForm categories={categories} errors={actionData?.errors} />
    </div>
  )
}

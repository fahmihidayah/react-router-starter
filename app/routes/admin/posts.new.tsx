import { useActionData } from 'react-router'
import { categoryRepository } from '~/features/categories/repositories'
import { createPostAction } from '~/features/posts/actions/create-post-action'
import { NewPostForm } from '~/features/posts/components/admin/form/new-post-form'
import type { Route } from './+types/posts.new'

export async function loader() {
  return await categoryRepository.findAll()
}

export async function action({ request }: Route.ActionArgs) {
  return createPostAction(request)
}

export function meta() {
  return [{ title: 'Add Post - Dashboard' }, { name: 'description', content: 'Add a new post' }]
}

export default function AddPostPage({ loaderData }: Route.ComponentProps) {
  const actionData = useActionData<typeof action>()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Add New Post</h3>
      <NewPostForm categories={loaderData} errors={actionData?.errors} />
    </div>
  )
}

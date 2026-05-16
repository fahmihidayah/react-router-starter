import { useActionData, useLoaderData, useSubmit } from 'react-router'
import { updatePostAction } from '~/features/posts/actions/update-post-action'
import { EditPostForm } from '~/features/posts/components/admin/form/edit-post-form'
import { getPostByIdLoader } from '~/features/posts/loaders/get-post-by-id-loader'
import { categoryRepository } from '~/features/categories/repositories'
import type { Route } from './+types/dashboard.posts.$id'

export async function loader({ params }: Route.LoaderArgs) {
  const post = await getPostByIdLoader(params.id)
  const categories = await categoryRepository.findAll()
  return { post, categories }
}

export async function action({ request, params }: Route.ActionArgs) {
  return updatePostAction(request, params.id)
}

export function meta() {
  return [
    { title: 'Edit Post - Dashboard' },
    { name: 'description', content: 'Edit post details' },
  ]
}

export default function EditPostPage() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  if (!loaderData.post) {
    return <div>Post not found</div>
  }

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Edit Post</h3>
      <EditPostForm
        post={loaderData.post}
        categories={loaderData.categories}
        errors={actionData?.errors}
        onSubmit={(fd) => submit(fd, { method: 'post' })}
      />
    </div>
  )
}

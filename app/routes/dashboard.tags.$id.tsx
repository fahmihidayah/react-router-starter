import { useActionData, useLoaderData, useSubmit } from 'react-router'
import { updateTagAction } from '~/features/tags/actions/update-tag-action'
import { EditTagForm } from '~/features/tags/components/admin/form/edit-tag-form'
import { getTagByIdLoader } from '~/features/tags/loaders/get-tag-by-id-loader'
import type { Route } from './+types/dashboard.tags.$id'

export async function loader({ params }: Route.LoaderArgs) {
  return getTagByIdLoader(params.id)
}

export async function action({ request, params }: Route.ActionArgs) {
  return updateTagAction(request, params.id)
}

export function meta() {
  return [
    { title: 'Edit Tag - Dashboard' },
    { name: 'description', content: 'Edit tag details' },
  ]
}

export default function EditTagPage() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  if (!loaderData) {
    return (
      <div className="container w-full mx-auto p-5">
        <p>Tag not found</p>
      </div>
    )
  }

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Edit Tag</h3>
      <EditTagForm tag={loaderData} errors={actionData?.errors} onSubmit={(fd) => submit(fd, { method: 'post' })} />
    </div>
  )
}

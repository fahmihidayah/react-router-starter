import { useActionData, useLoaderData, useSubmit } from 'react-router'
import { updateMediaAction } from '~/features/media/actions/update-media-action'
import { EditMediaForm } from '~/features/media/components/admin/form/edit-media-form'
import { getMediaByIdLoader } from '~/features/media/loaders/get-media-by-id-loader'
import type { Route } from './+types/dashboard.media.$id'

export async function loader({ params }: Route.LoaderArgs) {
  return getMediaByIdLoader(params.id)
}

export async function action({ request, params }: Route.ActionArgs) {
  return updateMediaAction(request, params.id)
}

export function meta() {
  return [{ title: 'Edit Media - Dashboard' }, { name: 'description', content: 'Edit media file' }]
}

export default function EditMediaPage() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Edit Media</h3>
      <EditMediaForm media={loaderData} errors={actionData?.errors} onSubmit={(fd) => submit(fd, { method: 'post' })} />
    </div>
  )
}

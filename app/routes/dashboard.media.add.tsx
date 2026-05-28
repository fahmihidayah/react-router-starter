import { useActionData, useSubmit } from 'react-router'
import { createMediaAction } from '~/features/media/actions/create-media-action'
import { AddMediaForm } from '~/features/media/components/admin/form/add-media-form'
import type { Route } from './+types/dashboard.media.add'

export async function action({ request }: Route.ActionArgs) {
  return createMediaAction(request)
}

export function meta() {
  return [
    { title: 'Add Media - Dashboard' },
    { name: 'description', content: 'Add new media file' },
  ]
}

export default function AddMediaPage() {
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Add New Media</h3>
      <AddMediaForm errors={actionData?.errors} onSubmit={(fd) => submit(fd, { method: 'post' })} />
    </div>
  )
}

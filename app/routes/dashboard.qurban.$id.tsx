import { useActionData, useLoaderData, useSubmit } from 'react-router'
import { updateQurbanAction } from '~/features/qurban/actions/update-qurban-action'
import { EditQurbanForm } from '~/features/qurban/components/admin/form/edit-qurban-form'
import { getQurbanByIdLoader } from '~/features/qurban/loaders/get-qurban-by-id-loader'
import type { Route } from './+types/dashboard.qurban.$id'

export async function loader({ params }: Route.LoaderArgs) {
  return getQurbanByIdLoader(params.id)
}

export async function action({ request, params }: Route.ActionArgs) {
  return updateQurbanAction(request, params.id)
}

export function meta() {
  return [
    { title: 'Edit Qurban - Dashboard' },
    { name: 'description', content: 'Edit qurban details' },
  ]
}

export default function EditQurbanPage() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  if (!loaderData) {
    return (
      <div className="container w-full mx-auto p-5">
        <p>Qurban not found</p>
      </div>
    )
  }

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Edit Qurban</h3>
      <EditQurbanForm qurban={loaderData} errors={actionData?.errors} onSubmit={(fd) => submit(fd, { method: 'post' })} />
    </div>
  )
}

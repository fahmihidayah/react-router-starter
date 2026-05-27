import { useActionData, useLoaderData, useSubmit } from 'react-router'
import { updateCongregationAction } from '~/features/congregations/actions/update-congregation-action'
import { EditCongregationForm } from '~/features/congregations/components/admin/form/edit-congregation-form'
import { getCongregationByIdLoader } from '~/features/congregations/loaders/get-congregation-by-id-loader'
import { getCongregationTagsLoader } from '~/features/congregations/loaders/get-congregation-tags-loader'
import { getAllTagsLoader } from '~/features/tags/loaders/get-all-tags-loader'
import type { Route } from './+types/dashboard.congregations.$id'

export async function loader({ params }: Route.LoaderArgs) {
  const congregation = await getCongregationByIdLoader(params.id)
  const tags = await getAllTagsLoader()
  const congregationTagIds = congregation ? await getCongregationTagsLoader(params.id) : []

  return { congregation, tags, congregationTagIds }
}

export async function action({ request, params }: Route.ActionArgs) {
  return updateCongregationAction(request, params.id)
}

export function meta() {
  return [
    { title: 'Edit Congregation - Dashboard' },
    { name: 'description', content: 'Edit congregation details' },
  ]
}

export default function EditCongregationPage() {
  const { congregation, tags, congregationTagIds } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  if (!congregation) {
    return (
      <div className="container w-full mx-auto p-5">
        <p>Congregation not found</p>
      </div>
    )
  }

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Edit Congregation</h3>
      <EditCongregationForm
        congregation={congregation}
        tags={tags}
        selectedTagIds={congregationTagIds}
        errors={actionData?.errors}
        onSubmit={(fd) => submit(fd, { method: 'post' })}
      />
    </div>
  )
}

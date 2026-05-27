import { useActionData, useLoaderData, useSubmit } from 'react-router'
import { createCongregationAction } from '~/features/congregations/actions/create-congregation-action'
import { AddCongregationForm } from '~/features/congregations/components/admin/form/add-congregation-form'
import { getAllTagsLoader } from '~/features/tags/loaders/get-all-tags-loader'
import type { Route } from './+types/dashboard.congregations.add'

export async function loader() {
  const tags = await getAllTagsLoader()
  return { tags }
}

export async function action({ request }: Route.ActionArgs) {
  return createCongregationAction(request)
}

export function meta() {
  return [
    { title: 'Add Congregation - Dashboard' },
    { name: 'description', content: 'Add a new congregation' },
  ]
}

export default function AddCongregationPage() {
  const { tags } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Add New Congregation</h3>
      <AddCongregationForm tags={tags} errors={actionData?.errors} onSubmit={(fd) => submit(fd, { method: 'post' })} />
    </div>
  )
}

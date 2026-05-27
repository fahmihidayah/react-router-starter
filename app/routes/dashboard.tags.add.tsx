import { useActionData, useSubmit } from 'react-router'
import { createTagAction } from '~/features/tags/actions/create-tag-action'
import { AddTagForm } from '~/features/tags/components/admin/form/add-tag-form'
import type { Route } from './+types/dashboard.tags.add'

export async function action({ request }: Route.ActionArgs) {
  return createTagAction(request)
}

export function meta() {
  return [
    { title: 'Add Tag - Dashboard' },
    { name: 'description', content: 'Add a new tag' },
  ]
}

export default function AddTagPage() {
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Add New Tag</h3>
      <AddTagForm errors={actionData?.errors} onSubmit={(fd) => submit(fd, { method: 'post' })} />
    </div>
  )
}

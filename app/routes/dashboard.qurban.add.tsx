import { useActionData, useSubmit } from 'react-router'
import { createQurbanAction } from '~/features/qurban/actions/create-qurban-action'
import { AddQurbanForm } from '~/features/qurban/components/admin/form/add-qurban-form'
import type { Route } from './+types/dashboard.qurban.add'

export async function action({ request }: Route.ActionArgs) {
  return createQurbanAction(request)
}

export function meta() {
  return [
    { title: 'Add Qurban - Dashboard' },
    { name: 'description', content: 'Add a new qurban' },
  ]
}

export default function AddQurbanPage() {
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Add New Qurban</h3>
      <AddQurbanForm errors={actionData?.errors} onSubmit={(fd) => submit(fd, { method: 'post' })} />
    </div>
  )
}

import { useActionData, useLoaderData, useSubmit } from 'react-router'
import { updateTransactionAction } from '~/features/transactions/actions/update-transaction-action'
import { EditTransactionForm } from '~/features/transactions/components/admin/form/edit-transaction-form'
import { getTransactionByIdLoader } from '~/features/transactions/loaders/get-transaction-by-id-loader'
import type { Route } from './+types/dashboard.transactions.$id'

export async function loader({ params }: Route.LoaderArgs) {
  return getTransactionByIdLoader(params.id)
}

export async function action({ request, params }: Route.ActionArgs) {
  return updateTransactionAction(request, params.id)
}

export function meta() {
  return [
    { title: 'Edit Transaction - Dashboard' },
    { name: 'description', content: 'Edit transaction details' },
  ]
}

export default function EditTransactionPage() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  if (!loaderData) {
    return (
      <div className="container w-full mx-auto p-5">
        <p>Transaction not found</p>
      </div>
    )
  }

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Edit Transaction</h3>
      <EditTransactionForm transaction={loaderData} errors={actionData?.errors} onSubmit={(fd) => submit(fd, { method: 'post' })} />
    </div>
  )
}

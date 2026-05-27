import { useActionData, useSubmit } from 'react-router'
import { createTransactionAction } from '~/features/transactions/actions/create-transaction-action'
import { AddTransactionForm } from '~/features/transactions/components/admin/form/add-transaction-form'
import type { Route } from './+types/dashboard.transactions.add'

export async function action({ request }: Route.ActionArgs) {
  return createTransactionAction(request)
}

export function meta() {
  return [
    { title: 'Add Transaction - Dashboard' },
    { name: 'description', content: 'Add a new transaction' },
  ]
}

export default function AddTransactionPage() {
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Add New Transaction</h3>
      <AddTransactionForm errors={actionData?.errors} onSubmit={(fd) => submit(fd, { method: 'post' })} />
    </div>
  )
}

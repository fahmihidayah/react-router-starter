import { useActionData } from 'react-router'
import { createUserAction } from '~/features/users/actions/create-user-action'
import { NewUserForm } from '~/features/users/components/admin/form/new-user-form'
import type { Route } from './+types/users.new'

export async function action({ request }: Route.ActionArgs) {
  return createUserAction(request)
}

export default function AddUserPage() {
  const actionData = useActionData<typeof action>()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Add New User</h3>
      <NewUserForm errors={actionData?.errors} />
    </div>
  )
}

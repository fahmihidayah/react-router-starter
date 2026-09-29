import { redirect, useActionData, useLoaderData } from 'react-router'
import { getAllRolesLoader } from '~/features/roles/loaders/get-all-roles-loader'
import { createUserAction } from '~/features/users/actions/create-user-action'
import { NewUserForm } from '~/features/users/components/admin/new-user-form'
import type { Route } from './+types/users.new'

export function loader() {
  return getAllRolesLoader()
}

export async function action(args: Route.ActionArgs) {
  const result = await createUserAction(args)
  if (result.success) {
    return redirect('/admin/users')
  } else {
    return result
  }
}

export default function AddUserPage() {
  const actionData = useActionData<typeof action>()
  const roles = useLoaderData<typeof loader>()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Add New User</h3>
      <NewUserForm roles={roles} errors={actionData?.error} />
    </div>
  )
}

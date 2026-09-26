import { useActionData, useLoaderData } from 'react-router'
import { updateUserAction } from '~/features/users/actions/update-user-action'
import { EditUserForm } from '~/features/users/components/admin/edit-user-form'
import { getUserByIdLoader } from '~/features/users/loaders/get-user-by-id-loader'
import { UserNotFoundError } from '~/features/users/types/errors'
import type { Route } from './+types/users.$id'

export async function loader(args: Route.LoaderArgs) {
  const response = await getUserByIdLoader(args)
  const data = response.data
  if (data === undefined) {
    throw new UserNotFoundError()
  } else {
    return {
      ...response,
      data,
    }
  }
}

// Server action - Update user using UserRepository
export async function action(args: Route.ActionArgs) {
  return updateUserAction(args)
}

export default function EditUserPage() {
  const response = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Edit User</h3>
      <EditUserForm user={response.data} errors={actionData?.errors} />
    </div>
  )
}

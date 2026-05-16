import { useActionData, useLoaderData, useSubmit } from 'react-router'
import { updateUserAction } from '~/features/users/actions/update-user-action'
import { EditUserForm } from '~/features/users/components/admin/form/edit-user-form'
import { getUserByIdLoader } from '~/features/users/loaders/get-user-by-id-loader'
import type { Route } from './+types/dashboard.users.$id'

export async function loader({ params }: Route.LoaderArgs) {
  return getUserByIdLoader(params.id)
}

// Server action - Update user using UserRepository
export async function action({ request, params }: Route.ActionArgs) {
  return updateUserAction(request, params.id)
}

export default function EditUserPage() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  const handleFormSubmit = (_data: unknown, formData: FormData) => {
    submit(formData, { method: 'post' })
  }

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Edit User</h3>
      <EditUserForm user={loaderData} errors={actionData?.errors} onSubmit={handleFormSubmit} />
    </div>
  )
}

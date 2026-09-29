import { useActionData, useLoaderData } from 'react-router'
import { updateRoleAction } from '~/features/roles/actions/update-role-action'
import { EditRoleForm } from '~/features/roles/components/admin/form/edit-role-form'
import { getRoleByIdLoader } from '~/features/roles/loaders/get-role-by-id-loader'
import type { Route } from './+types/roles.$id'

export async function loader({ params }: Route.LoaderArgs) {
  if (!params.id) throw new Response('Role ID is required', { status: 400 })
  const role = await getRoleByIdLoader(params.id)
  if (!role) throw new Response('Role not found', { status: 404 })
  return role
}

export function action(args: Route.ActionArgs) {
  return updateRoleAction(args)
}

export default function EditRolePage() {
  const role = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  return (
    <div className="container mx-auto flex w-full flex-col gap-5 p-5">
      <h1 className="text-2xl font-semibold tracking-tight">Edit Role</h1>
      <EditRoleForm role={role} errors={actionData?.errors} />
    </div>
  )
}

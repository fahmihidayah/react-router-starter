import { useActionData } from 'react-router'
import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import { createRoleAction } from '~/features/roles/actions/create-role-action'
import { NewRoleForm } from '~/features/roles/components/admin/form/new-role-form'
import type { Route } from './+types/roles.new'

export const middleware: Route.MiddlewareFunction[] = [
  enforceRoutePermissions({
    action: PERMISSION_KEYS.ROLES_CREATE,
    loader: PERMISSION_KEYS.ROLES_CREATE,
  }),
]

export function action(args: Route.ActionArgs) {
  return createRoleAction(args)
}

export default function NewRolePage() {
  const actionData = useActionData<typeof action>()
  return (
    <div className="container mx-auto flex w-full flex-col gap-5 p-5">
      <h1 className="text-2xl font-semibold tracking-tight">Add New Role</h1>
      <NewRoleForm errors={actionData?.errors} />
    </div>
  )
}

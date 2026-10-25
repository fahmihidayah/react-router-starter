import { Button } from '~/components/ui/button'
import type { TRole } from '~/db/schema'
import { RoleFormFields } from './role-form-fields'

export function EditRoleForm({
  role,
  errors,
}: {
  role: TRole
  errors?: Record<string, string[] | undefined>
}) {
  return (
    <form method="post" className="space-y-4">
      <div className="flex justify-end">
        <Button type="submit">Save</Button>
      </div>
      <RoleFormFields defaultValues={role} errors={errors} />
    </form>
  )
}

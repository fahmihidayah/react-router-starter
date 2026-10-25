import { Button } from '~/components/ui/button'
import { RoleFormFields } from './role-form-fields'

export function NewRoleForm({ errors }: { errors?: Record<string, string[] | undefined> }) {
  return (
    <form method="post" className="space-y-4">
      <div className="flex justify-end">
        <Button type="submit">Save</Button>
      </div>
      <RoleFormFields errors={errors} />
    </form>
  )
}

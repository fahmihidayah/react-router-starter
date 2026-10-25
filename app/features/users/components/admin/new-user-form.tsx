import { Button } from '~/components/ui/button'
import { ErrorDisplay } from '~/components/ui/error-display'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import type { TRole } from '~/db/schema'
import type { ErrorType } from '~/lib/types'

interface NewUserFormProps {
  errors?: ErrorType
  roles: TRole[]
}

export function NewUserForm({ errors, roles }: NewUserFormProps) {
  return (
    <>
      {errors && <ErrorDisplay errors={errors} />}
      <form method="post" className="space-y-4">
        <div className="flex flex-row justify-end">
          <Button type="submit">Save</Button>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" type="text" placeholder="User name" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="user@example.com" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="Password" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="roleId">Role</Label>
          <Select name="roleId" required>
            <SelectTrigger id="roleId" className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </form>
    </>
  )
}

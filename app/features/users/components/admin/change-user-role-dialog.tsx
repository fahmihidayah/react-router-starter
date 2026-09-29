import { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import type { TRole } from '~/db/schema'
import type { UserWithRoles } from '../../types'

type ChangeUserRoleDialogProps = {
  user: UserWithRoles | null
  roles: TRole[]
  onOpenChange: (open: boolean) => void
  onSubmit: (roleId: string) => void
}

export function ChangeUserRoleDialog({
  user,
  roles,
  onOpenChange,
  onSubmit,
}: ChangeUserRoleDialogProps) {
  const [roleId, setRoleId] = useState('')

  useEffect(() => {
    setRoleId(user?.roles[0]?.id ?? '')
  }, [user])

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change user role</DialogTitle>
          <DialogDescription>
            Select the role for {user?.name || user?.email}. This replaces the current role.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="change-role">Role</Label>
          <Select value={roleId} onValueChange={setRoleId}>
            <SelectTrigger id="change-role" className="w-full">
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
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!roleId} onClick={() => onSubmit(roleId)}>
            Save role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

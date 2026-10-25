import { ShieldCheck, UserPlus, UserRound } from 'lucide-react'
import { Form, useNavigation } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import * as m from '~/paraglide/messages.js'
import type { LearnerAccessUser } from '../../types'

interface AccessTabProps {
  users: LearnerAccessUser[]
  errors?: Record<string, string[] | undefined>
}

const accessRoleLabels = {
  owner: m.learner_access_role_owner,
  parent: m.learner_access_role_parent,
  teacher: m.learner_access_role_teacher,
  viewer: m.learner_access_role_viewer,
} as const

export function AccessTab({ users, errors }: AccessTabProps) {
  const navigation = useNavigation()
  const isAdding =
    navigation.state === 'submitting' && navigation.formData?.get('intent') === 'addAccess'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{m.learner_access_add_title()}</CardTitle>
          <CardDescription>{m.learner_access_add_description()}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            method="post"
            className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end"
          >
            <input type="hidden" name="intent" value="addAccess" />
            <div className="space-y-2">
              <Label htmlFor="access-email">{m.learner_access_email()}</Label>
              <Input
                id="access-email"
                name="email"
                type="email"
                placeholder="user@example.com"
                aria-invalid={errors?.email ? true : undefined}
                required
              />
              {errors?.email?.map((error) => (
                <p key={error} className="text-sm text-destructive">
                  {error}
                </p>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="access-role">{m.learner_access_role()}</Label>
              <Select name="role" defaultValue="viewer" required>
                <SelectTrigger
                  id="access-role"
                  className="w-full"
                  aria-invalid={errors?.role ? true : undefined}
                >
                  <SelectValue placeholder={m.learner_access_select_role()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">{m.learner_access_role_parent()}</SelectItem>
                  <SelectItem value="teacher">{m.learner_access_role_teacher()}</SelectItem>
                  <SelectItem value="viewer">{m.learner_access_role_viewer()}</SelectItem>
                </SelectContent>
              </Select>
              {errors?.role?.map((error) => (
                <p key={error} className="text-sm text-destructive">
                  {error}
                </p>
              ))}
            </div>
            <Button type="submit" disabled={isAdding}>
              <UserPlus />
              {isAdding ? m.learner_access_adding() : m.learner_access_add_title()}
            </Button>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{m.learner_access_people_title()}</CardTitle>
          <CardDescription>{m.learner_access_people_description()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y rounded-lg border">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-4 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium">
                  {user.image ? (
                    <img src={user.image} alt="" className="size-full object-cover" />
                  ) : (
                    <UserRound className="size-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{user.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  <ShieldCheck className="size-3.5" /> {accessRoleLabels[user.role]()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'

type RoleFormFieldsProps = {
  defaultValues?: { name: string; description: string | null }
  errors?: Record<string, string[] | undefined>
}

export function RoleFormFields({ defaultValues, errors }: RoleFormFieldsProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues?.name}
          aria-invalid={!!errors?.name?.length}
          placeholder="Role name"
        />
        {errors?.name?.[0] && <p className="text-sm text-destructive">{errors.name[0]}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description ?? ''}
          aria-invalid={!!errors?.description?.length}
          placeholder="What can users with this role do?"
        />
        {errors?.description?.[0] && (
          <p className="text-sm text-destructive">{errors.description[0]}</p>
        )}
      </div>
    </>
  )
}

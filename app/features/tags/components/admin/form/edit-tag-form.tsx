import { Button } from '~/components/ui/button'
import { ErrorDisplay } from '~/components/ui/error-display'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { TTag } from '~/db/schema'

interface EditTagFormProps {
  tag: TTag
  errors?: Record<string, string[] | undefined>
}

export function EditTagForm({ tag, errors }: EditTagFormProps) {
  return (
    <>
      {errors && <ErrorDisplay errors={errors} />}
      <form method="post" className="space-y-4">
        <div className="flex flex-row justify-end">
          <Button type="submit">Save</Button>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Tag name"
            maxLength={50}
            defaultValue={tag.name || ''}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            name="color"
            type="color"
            defaultValue={tag.color || '#000000'}
          />
        </div>
      </form>
    </>
  )
}

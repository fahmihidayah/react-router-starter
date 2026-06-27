import { Button } from '~/components/ui/button'
import { ErrorDisplay } from '~/components/ui/error-display'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { TCategory } from '~/db/schema'

interface EditCategoryFormProps {
  category: TCategory
  errors?: Record<string, string[] | undefined>
}

export function EditCategoryForm({ category, errors }: EditCategoryFormProps) {
  return (
    <>
      {errors && <ErrorDisplay errors={errors} />}
      <form method="post" className="space-y-4">
        <div className="flex flex-row justify-end">
          <Button type="submit">Save</Button>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="Category title"
            defaultValue={category.title || ''}
          />
        </div>
      </form>
    </>
  )
}

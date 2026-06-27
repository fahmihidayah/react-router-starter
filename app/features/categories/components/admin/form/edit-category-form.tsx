import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { TCategory } from '~/db/schema'

interface EditCategoryFormProps {
  category: TCategory
  errors?: Record<string, string[] | undefined>
}

export function EditCategoryForm({ category, errors }: EditCategoryFormProps) {
  const titleError = errors?.title?.[0]

  return (
    <form method="post" className="space-y-4">
      <div className="flex flex-row justify-end">
        <Button type="submit">Save</Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="title" className={titleError ? 'text-destructive' : ''}>
          Title
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Category title"
          defaultValue={category.title || ''}
          aria-invalid={!!titleError}
          aria-describedby={titleError ? 'title-error' : undefined}
          className={titleError ? 'border-destructive' : ''}
        />
        {titleError && (
          <p id="title-error" className="text-destructive text-sm">
            {titleError}
          </p>
        )}
      </div>
    </form>
  )
}

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

interface AddTagFormProps {
  errors?: Record<string, string[] | undefined>
}

export function AddTagForm({ errors }: AddTagFormProps) {
  const nameError = errors?.name?.[0]
  const colorError = errors?.color?.[0]

  return (
    <form method="post" className="space-y-4">
      <div className="flex flex-row justify-end">
        <Button type="submit">Save</Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name" className={nameError ? 'text-destructive' : ''}>
          Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Tag name"
          maxLength={50}
          aria-invalid={!!nameError}
          aria-describedby={nameError ? 'name-error' : undefined}
          className={nameError ? 'border-destructive' : ''}
        />
        {nameError && (
          <p id="name-error" className="text-destructive text-sm">
            {nameError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="color" className={colorError ? 'text-destructive' : ''}>
          Color
        </Label>
        <Input
          id="color"
          name="color"
          type="color"
          defaultValue="#000000"
          aria-invalid={!!colorError}
          aria-describedby={colorError ? 'color-error' : undefined}
          className={colorError ? 'border-destructive' : ''}
        />
        {colorError && (
          <p id="color-error" className="text-destructive text-sm">
            {colorError}
          </p>
        )}
      </div>
    </form>
  )
}

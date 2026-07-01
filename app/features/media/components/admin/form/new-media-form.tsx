import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { UploadField } from '~/components/ui/upload-field'

interface NewMediaFormProps {
  errors?: Record<string, string[] | undefined>
}

export function NewMediaForm({ errors }: NewMediaFormProps) {
  const urlError = errors?.url?.[0]
  const altError = errors?.alt?.[0]

  return (
    <form method="post" encType="multipart/form-data" className="space-y-4">
      <div className="flex flex-row justify-end">
        <Button type="submit">Save</Button>
      </div>

      <UploadField
        name="file"
        label="Upload File"
        description="Select a file to upload (URL and filename will be generated automatically)"
        accept="*/*"
        error={urlError}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="alt" className={altError ? 'text-destructive' : ''}>
          Alt Text (Optional)
        </Label>
        <Input
          id="alt"
          name="alt"
          placeholder="Descriptive alt text for accessibility"
          aria-invalid={!!altError}
          aria-describedby={altError ? 'alt-error' : undefined}
          className={altError ? 'border-destructive' : ''}
        />
        {altError && (
          <p id="alt-error" className="text-destructive text-sm">
            {altError}
          </p>
        )}
      </div>
    </form>
  )
}

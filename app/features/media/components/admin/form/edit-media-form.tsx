import { Button } from '~/components/ui/button'
import { ErrorDisplay } from '~/components/ui/error-display'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { UploadField } from '~/components/ui/upload-field'
import type { TMedia } from '~/db/schema'

interface EditMediaFormProps {
  media: TMedia
  errors?: Record<string, string[] | undefined>
}

export function EditMediaForm({ media, errors }: EditMediaFormProps) {
  return (
    <>
      {errors && <ErrorDisplay errors={errors} />}
      <form method="post" encType="multipart/form-data" className="space-y-4">
        <div className="flex flex-row justify-end">
          <Button type="submit">Save</Button>
        </div>

        <UploadField
          name="file"
          label="Replace File (Optional)"
          description="Select a new file to replace the current one (URL and filename will be updated automatically)"
          accept="*/*"
          error={errors?.file?.[0]}
          defaultImageUrl={media.url}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="alt">Alt Text (Optional)</Label>
          <Input
            id="alt"
            name="alt"
            placeholder="Descriptive alt text for accessibility"
            defaultValue={media.alt || ''}
          />
        </div>
      </form>
    </>
  )
}

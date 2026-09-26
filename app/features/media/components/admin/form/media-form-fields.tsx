import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { UploadField } from '~/components/ui/upload-field'

type MediaFormFieldsProps = {
  alt?: string | null
  currentUrl?: string
  fileRequired?: boolean
  errors?: Record<string, string[] | undefined>
}

export function MediaFormFields({
  alt,
  currentUrl,
  fileRequired = false,
  errors,
}: MediaFormFieldsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
      <UploadField
        name="file"
        label={fileRequired ? 'Image' : 'Replace image'}
        description="Drag an image here or browse. It will be converted to WebP (maximum 10 MB)."
        accept="image/*"
        defaultImageUrl={currentUrl}
        error={errors?.file?.[0]}
        required={fileRequired}
      />
      <div className="space-y-2">
        <Label htmlFor="alt">Alternative text</Label>
        <Input
          id="alt"
          name="alt"
          defaultValue={alt || ''}
          placeholder="Describe the image"
          aria-invalid={Boolean(errors?.alt?.[0])}
        />
        <p className="text-sm text-muted-foreground">
          Keep this concise and describe the image's purpose for screen readers.
        </p>
        {errors?.alt?.[0] && <p className="text-sm text-destructive">{errors.alt[0]}</p>}
      </div>
    </div>
  )
}

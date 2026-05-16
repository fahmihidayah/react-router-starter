import { Button } from '~/components/ui/button'
import { ErrorDisplay } from '~/components/ui/error-display'
import { Input } from '~/components/ui/input'
import { UploadField } from '~/components/ui/upload-field'

interface AddMediaFormProps {
  errors?: Record<string, string[] | undefined>
}

export function AddMediaForm({ errors }: AddMediaFormProps) {
  return (
    <>
      {errors && <ErrorDisplay errors={errors} />}
      <form method="post" encType="multipart/form-data" className="space-y-4">
        <div className="flex flex-row justify-end">
          <Button type="submit">Save</Button>
        </div>

        <UploadField
          name="file"
          label="Upload File"
          description="Select a file to upload (URL and filename will be generated automatically)"
          accept="*/*"
          error={errors?.file?.[0]}
        />

        <div>
          <label htmlFor="alt" className="block text-sm font-medium">
            Alt Text (Optional)
          </label>
          <Input
            id="alt"
            name="alt"
            placeholder="Descriptive alt text for accessibility"
            className="mt-1"
          />
          {errors?.alt && <p className="mt-1 text-sm text-red-600">{errors.alt[0]}</p>}
        </div>
      </form>
    </>
  )
}

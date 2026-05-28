import { Button } from '~/components/ui/button'
import { ErrorDisplay } from '~/components/ui/error-display'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { UploadField } from '~/components/ui/upload-field'

interface AddMediaFormProps {
  errors?: Record<string, string[] | undefined>
  onSubmit?: (formData: FormData) => void | Promise<void>
}

export function AddMediaForm({ errors, onSubmit }: AddMediaFormProps) {
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    if (onSubmit) {
      await onSubmit(formData)
    }
  }

  return (
    <>
      {errors && <ErrorDisplay errors={errors} />}
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="alt">Alt Text (Optional)</Label>
          <Input
            id="alt"
            name="alt"
            placeholder="Descriptive alt text for accessibility"
          />
        </div>
      </form>
    </>
  )
}

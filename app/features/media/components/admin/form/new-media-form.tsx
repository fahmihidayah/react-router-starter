import { MediaForm } from './media-form'
import { MediaFormFields } from './media-form-fields'

type NewMediaFormProps = {
  errors?: Record<string, string[] | undefined>
}

export function NewMediaForm({ errors }: NewMediaFormProps) {
  return (
    <MediaForm error={errors?.form?.[0]}>
      <MediaFormFields errors={errors} fileRequired />
    </MediaForm>
  )
}

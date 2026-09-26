import type { TMedia } from '~/db/schema'
import { MediaForm } from './media-form'
import { MediaFormFields } from './media-form-fields'

type EditMediaFormProps = {
  media: TMedia
  errors?: Record<string, string[] | undefined>
}

export function EditMediaForm({ media, errors }: EditMediaFormProps) {
  return (
    <MediaForm error={errors?.form?.[0]} submitLabel="Save changes">
      <MediaFormFields alt={media.alt} currentUrl={media.url} errors={errors} />
    </MediaForm>
  )
}

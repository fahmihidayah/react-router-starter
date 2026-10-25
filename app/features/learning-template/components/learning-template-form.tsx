import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { NativeSelect, NativeSelectOption } from '~/components/ui/native-select'
import type { TLearningTemplate } from '~/db/schema'
import * as m from '~/paraglide/messages.js'
import { FieldError } from './field-error'

export function LearningTemplateForm({
  template,
  errors,
}: {
  template?: TLearningTemplate
  errors?: Record<string, string[] | undefined>
}) {
  return (
    <form method="post" className="space-y-6">
      {template ? <input type="hidden" name="intent" value="update" /> : null}
      <div className="space-y-2">
        <Label htmlFor="template-title">{m.learning_template_title()}</Label>
        <Input
          id="template-title"
          name="title"
          defaultValue={template?.title ?? ''}
          placeholder={m.learning_template_title_placeholder()}
          required
        />
        <FieldError value={errors?.title?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="template-visibility">{m.learning_template_visibility()}</Label>
        <NativeSelect
          id="template-visibility"
          name="visibility"
          className="w-full"
          defaultValue={template?.visibility ?? 'private'}
        >
          <NativeSelectOption value="private">{m.learning_template_private()}</NativeSelectOption>
          <NativeSelectOption value="public">{m.learning_template_public()}</NativeSelectOption>
        </NativeSelect>
        <p className="text-sm text-muted-foreground">{m.learning_template_visibility_help()}</p>
        <FieldError value={errors?.visibility?.[0]} />
      </div>
      <div className="flex justify-end gap-3">
        <Button asChild variant="outline">
          <Link
            to={
              template
                ? `/track-app/learning-templates/${template.id}`
                : '/track-app/learning-templates'
            }
          >
            {m.learning_template_cancel()}
          </Link>
        </Button>
        <Button type="submit">
          {template ? m.learning_template_save() : m.learning_template_create_action()}
        </Button>
      </div>
    </form>
  )
}

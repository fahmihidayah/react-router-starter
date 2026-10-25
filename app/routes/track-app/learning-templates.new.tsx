import { ArrowLeft } from 'lucide-react'
import { Link, useActionData } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { createLearningTemplateAction } from '~/features/learning-template/actions'
import { LearningTemplateForm } from '~/features/learning-template/components'
import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import * as m from '~/paraglide/messages.js'
import type { Route } from './+types/learning-templates.new'

export const middleware: Route.MiddlewareFunction[] = [
  enforceRoutePermissions({
    action: PERMISSION_KEYS.LEARNING_TEMPLATES_CREATE,
    loader: PERMISSION_KEYS.LEARNING_TEMPLATES_CREATE,
  }),
]

export function meta() {
  return [{ title: m.learning_template_new_meta_title() }]
}

export function action(args: Route.ActionArgs) {
  return createLearningTemplateAction(args)
}

export default function NewLearningTemplatePage() {
  const actionData = useActionData<typeof action>()
  const errors = actionData && !(actionData instanceof Response) ? actionData.errors : undefined
  return (
    <div className="flex-1 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Button asChild variant="ghost" className="-ml-3">
          <Link to="/track-app/learning-templates">
            <ArrowLeft /> {m.learning_template_back()}
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{m.learning_template_new()}</CardTitle>
            <CardDescription>{m.learning_template_new_description()}</CardDescription>
          </CardHeader>
          <CardContent>
            <LearningTemplateForm errors={errors} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

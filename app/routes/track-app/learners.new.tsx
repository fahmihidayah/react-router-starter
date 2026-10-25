import { ArrowLeft } from 'lucide-react'
import { Link, useActionData } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { createLearnerAction } from '~/features/learners/actions/learner-actions'
import { LearnerForm } from '~/features/learners/components/learner-form'
import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import * as m from '~/paraglide/messages.js'
import type { Route } from './+types/learners.new'

export const middleware: Route.MiddlewareFunction[] = [
  enforceRoutePermissions({
    action: PERMISSION_KEYS.LEARNERS_CREATE,
    loader: PERMISSION_KEYS.LEARNERS_CREATE,
  }),
]

export function meta() {
  return [{ title: m.learner_new_meta_title() }]
}

export function action(args: Route.ActionArgs) {
  return createLearnerAction(args)
}

export default function NewLearnerPage() {
  const actionData = useActionData<typeof action>()

  return (
    <div className="flex-1 p-6">
      <div className="w-full space-y-6">
        <Button asChild variant="ghost" className="-ml-3">
          <Link to="/track-app/learners">
            <ArrowLeft /> {m.learner_back_to_learners()}
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{m.learner_new_title()}</CardTitle>
            <CardDescription>{m.learner_new_description()}</CardDescription>
          </CardHeader>
          <CardContent>
            <LearnerForm
              errors={actionData && 'errors' in actionData ? actionData.errors : undefined}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Archive, ArrowLeft } from 'lucide-react'
import { Form, Link, useActionData, useLoaderData } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
  addLearningTemplateGoalAction,
  applyLearningTemplateAction,
  archiveLearningTemplateAction,
  deleteLearningTemplateGoalAction,
  moveLearningTemplateGoalAction,
  updateLearningTemplateAction,
  updateLearningTemplateGoalAction,
} from '~/features/learning-template/actions'
import {
  ApplyTemplateForm,
  LearningTemplateForm,
  TemplateGoalForm,
  TemplateGoalList,
} from '~/features/learning-template/components'
import { learningTemplateDetailLoader } from '~/features/learning-template/loaders'
import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import * as m from '~/paraglide/messages.js'
import type { Route } from './+types/learning-templates.$id'

export const middleware: Route.MiddlewareFunction[] = [
  enforceRoutePermissions({
    intents: {
      addGoal: PERMISSION_KEYS.LEARNING_TEMPLATES_UPDATE,
      apply: PERMISSION_KEYS.LEARNING_TEMPLATES_APPLY,
      archive: PERMISSION_KEYS.LEARNING_TEMPLATES_DELETE,
      deleteGoal: PERMISSION_KEYS.LEARNING_TEMPLATES_UPDATE,
      editGoal: PERMISSION_KEYS.LEARNING_TEMPLATES_UPDATE,
      moveGoal: PERMISSION_KEYS.LEARNING_TEMPLATES_UPDATE,
      update: PERMISSION_KEYS.LEARNING_TEMPLATES_UPDATE,
    },
    loader: PERMISSION_KEYS.LEARNING_TEMPLATES_READ,
  }),
]

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? `${data.template.title} - Track App` : m.learning_template_meta_title() }]
}

export function loader(args: Route.LoaderArgs) {
  if (!args.params.id) throw new Response('Template ID is required', { status: 400 })
  return learningTemplateDetailLoader(args, args.params.id)
}

export async function action(args: Route.ActionArgs) {
  const templateId = args.params.id
  if (!templateId) throw new Response('Template ID is required', { status: 400 })
  const formData = await args.request.clone().formData()
  const intent = formData.get('intent')
  if (intent === 'update') return updateLearningTemplateAction(args, templateId)
  if (intent === 'addGoal') return addLearningTemplateGoalAction(args, templateId)
  if (intent === 'deleteGoal') {
    const goalId = formData.get('goalId')
    if (typeof goalId !== 'string') throw new Response('Goal ID is required', { status: 400 })
    return deleteLearningTemplateGoalAction(args, templateId, goalId)
  }
  if (intent === 'editGoal') {
    const goalId = formData.get('goalId')
    if (typeof goalId !== 'string') throw new Response('Goal ID is required', { status: 400 })
    return updateLearningTemplateGoalAction(args, templateId, goalId)
  }
  if (intent === 'moveGoal') {
    const goalId = formData.get('goalId')
    const direction = formData.get('direction')
    if (typeof goalId !== 'string') throw new Response('Goal ID is required', { status: 400 })
    if (typeof direction !== 'string') throw new Response('Direction is required', { status: 400 })
    return moveLearningTemplateGoalAction(args, templateId, goalId, direction)
  }
  if (intent === 'archive') return archiveLearningTemplateAction(args, templateId)
  if (intent === 'apply') return applyLearningTemplateAction(args, templateId)
  throw new Response('Unsupported action', { status: 400 })
}

export default function LearningTemplateDetailPage() {
  const { template, learners, isOwner } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const failure =
    actionData && !(actionData instanceof Response) && 'errors' in actionData
      ? actionData
      : undefined
  const goalErrors = failure?.operation === 'add-goal' ? failure.errors : undefined
  const updateErrors = failure?.operation === 'update' ? failure.errors : undefined
  const editGoalErrors = failure?.operation === 'edit-goal' ? failure.errors : undefined
  const editGoalId = failure?.operation === 'edit-goal' ? failure.goalId : undefined
  const applyErrors = failure?.operation === 'apply' ? failure.errors : undefined

  return (
    <div className="flex-1 p-6">
      <div className="w-full space-y-6">
        <Button asChild variant="ghost" className="-ml-3">
          <Link to="/track-app/learning-templates">
            <ArrowLeft /> {m.learning_template_back()}
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {template.visibility === 'public'
                  ? m.learning_template_public()
                  : m.learning_template_private()}
              </span>
              <span>·</span>
              <span>{m.learning_template_by({ name: template.ownerName })}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{template.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <ApplyTemplateForm
              learners={learners}
              errors={applyErrors}
              duplicate={failure?.operation === 'apply' && failure.duplicate}
              defaultOpen={failure?.operation === 'apply'}
              disabled={template.goals.length === 0}
            />
            {isOwner ? (
              <TemplateGoalForm
                errors={goalErrors}
                defaultOpen={failure?.operation === 'add-goal'}
              />
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{m.learning_template_goals()}</h2>
              <p className="text-sm text-muted-foreground">
                {m.learning_template_goals_description()}
              </p>
            </div>
            <TemplateGoalList
              goals={template.goals}
              editable={isOwner}
              editErrors={editGoalErrors}
              editGoalId={editGoalId}
            />
          </section>

          {isOwner ? (
            <aside className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{m.learning_template_settings()}</CardTitle>
                  <CardDescription>{m.learning_template_settings_description()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <LearningTemplateForm template={template} errors={updateErrors} />
                </CardContent>
              </Card>
              <Form method="post">
                <input type="hidden" name="intent" value="archive" />
                <Button type="submit" variant="destructive" className="w-full">
                  <Archive /> {m.learning_template_archive()}
                </Button>
              </Form>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  )
}

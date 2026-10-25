import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react'
import { Form } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import type { TLearningTemplateGoal } from '~/db/schema'
import * as m from '~/paraglide/messages.js'
import { TemplateGoalForm } from './template-goal-form'

export function TemplateGoalList({
  goals,
  editable,
  editErrors,
  editGoalId,
}: {
  goals: TLearningTemplateGoal[]
  editable: boolean
  editErrors?: Record<string, string[] | undefined>
  editGoalId?: string
}) {
  if (!goals.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          {m.learning_template_no_goals()}
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="space-y-3">
      {goals.map((goal, index) => (
        <Card key={goal.id} className="py-4">
          <CardContent className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">#{index + 1}</span>
                <h3 className="font-semibold">{goal.title}</h3>
              </div>
              {goal.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
              ) : null}
              <p className="mt-2 text-sm">
                {m.learning_template_goal_summary({
                  target: goal.targetValue,
                  unit: goal.unit,
                  days: goal.durationDays,
                })}
              </p>
            </div>
            {editable ? (
              <div className="flex shrink-0 items-center gap-1">
                <Form method="post">
                  <input type="hidden" name="intent" value="moveGoal" />
                  <input type="hidden" name="goalId" value={goal.id} />
                  <input type="hidden" name="direction" value="up" />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    disabled={index === 0}
                    aria-label={m.learning_template_move_up()}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                </Form>
                <Form method="post">
                  <input type="hidden" name="intent" value="moveGoal" />
                  <input type="hidden" name="goalId" value={goal.id} />
                  <input type="hidden" name="direction" value="down" />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    disabled={index === goals.length - 1}
                    aria-label={m.learning_template_move_down()}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                </Form>
                <TemplateGoalForm
                  goal={goal}
                  errors={goal.id === editGoalId ? editErrors : undefined}
                  defaultOpen={goal.id === editGoalId}
                  trigger={
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={m.learning_template_edit_goal()}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                <Form method="post">
                  <input type="hidden" name="intent" value="deleteGoal" />
                  <input type="hidden" name="goalId" value={goal.id} />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    aria-label={m.learning_template_delete_goal()}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </Form>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

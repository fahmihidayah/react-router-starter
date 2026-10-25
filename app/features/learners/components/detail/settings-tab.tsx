import { Trash2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import type { TLearner } from '~/db/schema'
import * as m from '~/paraglide/messages.js'
import { DeleteLearnerDialog } from '../delete-learner-dialog'
import { LearnerForm } from '../learner-form'

interface SettingsTabProps {
  learner: TLearner
  errors?: Record<string, string[] | undefined>
}

export function SettingsTab({ learner, errors }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{m.learner_profile_settings_title()}</CardTitle>
          <CardDescription>{m.learner_profile_settings_description()}</CardDescription>
        </CardHeader>
        <CardContent>
          <LearnerForm learner={learner} errors={errors} />
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>{m.learner_delete_action()}</CardTitle>
          <CardDescription>{m.learner_delete_description()}</CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteLearnerDialog
            learner={learner}
            trigger={
              <Button variant="destructive">
                <Trash2 /> {m.learner_delete_action()}
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}

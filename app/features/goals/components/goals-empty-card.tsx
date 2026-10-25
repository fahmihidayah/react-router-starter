import { Target } from 'lucide-react'
import { Card, CardContent } from '~/components/ui/card'
import * as m from '~/paraglide/messages.js'

export function GoalsEmptyCard() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center py-10 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Target className="size-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold">{m.learner_no_goals()}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{m.goal_empty_description()}</p>
      </CardContent>
    </Card>
  )
}

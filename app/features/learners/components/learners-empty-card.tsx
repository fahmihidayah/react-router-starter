import { UserRound } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import * as m from '~/paraglide/messages.js'

export function LearnersEmptyCard() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center py-10 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <UserRound className="size-7 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">{m.learner_empty_title()}</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {m.learner_empty_description()}
        </p>
        <Button asChild className="mt-5">
          <Link to="/track-app/learners/new">{m.learner_create()}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

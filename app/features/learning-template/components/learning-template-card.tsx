import { Globe2, Lock, Target } from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import * as m from '~/paraglide/messages.js'
import type { LearningTemplateCatalogItem } from '../types'

export function LearningTemplateCard({ template }: { template: LearningTemplateCatalogItem }) {
  const VisibilityIcon = template.visibility === 'public' ? Globe2 : Lock
  return (
    <Link to={`/track-app/learning-templates/${template.id}`} className="block h-full">
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="line-clamp-2">{template.title}</CardTitle>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
              <VisibilityIcon className="size-3" />
              {template.visibility === 'public'
                ? m.learning_template_public()
                : m.learning_template_private()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {m.learning_template_by({ name: template.ownerName })}
        </CardContent>
        <CardFooter className="mt-auto gap-2 text-sm text-muted-foreground">
          <Target className="size-4" />
          {m.learning_template_goal_count({ count: template.goalCount })}
        </CardFooter>
      </Card>
    </Link>
  )
}

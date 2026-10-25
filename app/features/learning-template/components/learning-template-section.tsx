import { LibraryBig } from 'lucide-react'
import { Card, CardContent } from '~/components/ui/card'
import type { LearningTemplateCatalogItem } from '../types'
import { LearningTemplateCard } from './learning-template-card'

export function LearningTemplateSection({
  title,
  description,
  emptyText,
  templates,
}: {
  title: string
  description: string
  emptyText: string
  templates: LearningTemplateCatalogItem[]
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {templates.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <LearningTemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
            <LibraryBig className="size-5" /> {emptyText}
          </CardContent>
        </Card>
      )}
    </section>
  )
}

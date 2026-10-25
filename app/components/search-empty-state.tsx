import { SearchX } from 'lucide-react'
import { Card, CardContent } from '~/components/ui/card'

export function SearchEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center py-10 text-center">
        <SearchX className="mb-3 size-7 text-muted-foreground" />
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

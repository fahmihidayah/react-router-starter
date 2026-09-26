import type { ReactNode } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'

type MediaFormProps = {
  children: ReactNode
  error?: string
  submitLabel?: string
}

export function MediaForm({ children, error, submitLabel = 'Save media' }: MediaFormProps) {
  return (
    <form method="post" encType="multipart/form-data" className="space-y-5">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <Card>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}

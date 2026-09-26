import { useActionData } from 'react-router'
import { createMediaAction } from '~/features/media/actions'
import { NewMediaForm } from '~/features/media/components/admin/form'
import type { Route } from './+types/media.new'

export function action(args: Route.ActionArgs) {
  return createMediaAction(args)
}

export function meta() {
  return [{ title: 'Upload media - Dashboard' }]
}

export default function NewMediaPage() {
  const actionData = useActionData<typeof action>()
  return (
    <div className="container mx-auto flex w-full flex-col gap-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload media</h1>
        <p className="text-muted-foreground">Images are optimized and stored as WebP.</p>
      </div>
      <NewMediaForm errors={actionData?.errors} />
    </div>
  )
}

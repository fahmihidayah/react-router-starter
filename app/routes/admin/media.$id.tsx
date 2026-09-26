import { useActionData, useLoaderData } from 'react-router'
import { updateMediaAction } from '~/features/media/actions'
import { EditMediaForm } from '~/features/media/components/admin/form'
import { getMediaByIdLoader } from '~/features/media/loaders/get-media-by-id-loader'
import type { Route } from './+types/media.$id'

export async function loader({ params }: Route.LoaderArgs) {
  const item = await getMediaByIdLoader(params.id)
  if (!item) throw new Response('Media not found', { status: 404 })
  return item
}

export function action(args: Route.ActionArgs) {
  return updateMediaAction(args)
}

export function meta() {
  return [{ title: 'Edit media - Dashboard' }]
}

export default function EditMediaPage() {
  const item = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  return (
    <div className="container mx-auto flex w-full flex-col gap-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit media</h1>
        <p className="text-muted-foreground">Update the description or replace the image.</p>
      </div>
      <EditMediaForm media={item} errors={actionData?.errors} />
    </div>
  )
}

import { createMediaAction } from '~/features/media/actions/create-media-action'
import { NewMediaForm } from '~/features/media/components/admin/form/new-media-form'
import type { Route } from './+types/media.new'

export async function action({ request }: Route.ActionArgs) {
  return createMediaAction(request)
}

export function meta() {
  return [
    { title: 'Add Media - Dashboard' },
    { name: 'description', content: 'Add new media file' },
  ]
}

export default function AddMediaPage({ actionData }: Route.ComponentProps) {
  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Add New Media</h3>
      <NewMediaForm errors={actionData?.errors} />
    </div>
  )
}

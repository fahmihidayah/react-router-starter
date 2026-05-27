import { useActionData, useLoaderData, useSubmit } from 'react-router'
import { updateEventAction } from '~/features/events/actions/update-event-action'
import { EditEventForm } from '~/features/events/components/admin/form/edit-event-form'
import { getEventByIdLoader } from '~/features/events/loaders/get-event-by-id-loader'
import type { Route } from './+types/dashboard.events.$id'

export async function loader({ params }: Route.LoaderArgs) {
  return getEventByIdLoader(params.id)
}

export async function action({ request, params }: Route.ActionArgs) {
  return updateEventAction(request, params.id)
}

export function meta() {
  return [
    { title: 'Edit Event - Dashboard' },
    { name: 'description', content: 'Edit event details' },
  ]
}

export default function EditEventPage() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  if (!loaderData) {
    return (
      <div className="container w-full mx-auto p-5">
        <p>Event not found</p>
      </div>
    )
  }

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Edit Event</h3>
      <EditEventForm event={loaderData} errors={actionData?.errors} onSubmit={(fd) => submit(fd, { method: 'post' })} />
    </div>
  )
}

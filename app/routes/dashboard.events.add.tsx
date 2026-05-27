import { useActionData, useSubmit } from 'react-router'
import { createEventAction } from '~/features/events/actions/create-event-action'
import { AddEventForm } from '~/features/events/components/admin/form/add-event-form'
import type { Route } from './+types/dashboard.events.add'

export async function action({ request }: Route.ActionArgs) {
  return createEventAction(request)
}

export function meta() {
  return [
    { title: 'Add Event - Dashboard' },
    { name: 'description', content: 'Add a new event' },
  ]
}

export default function AddEventPage() {
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  return (
    <div className="container w-full mx-auto p-5 flex flex-col gap-5">
      <h3 className="text-2xl">Add New Event</h3>
      <AddEventForm errors={actionData?.errors} onSubmit={(fd) => submit(fd, { method: 'post' })} />
    </div>
  )
}

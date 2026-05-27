import { useState } from 'react'
import { useLoaderData, useNavigate, useSearchParams, useSubmit } from 'react-router'
import { toast } from 'sonner'
import createColumn from '~/components/admin/table/column/create-column'
import { DataTable, DeleteDialog, TablePagination } from '~/components/admin/table/table-list'
import { deleteManyEventsAction } from '~/features/events/actions/delete-many-events-action'
import { deleteEventAction } from '~/features/events/actions/delete-event-action'
import { getEventsLoader } from '~/features/events/loaders/get-events-loader'
import type { TEvent } from '~/db/schema'
import type { Route } from './+types/dashboard.events._index'

export async function loader({ request }: Route.LoaderArgs) {
  return await getEventsLoader(request)
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  try {
    if (intent === 'delete') {
      const eventId = formData.get('eventId')?.toString()
      if (eventId) {
        return deleteEventAction(eventId)
      }
    }

    if (intent === 'deleteMany') {
      const idsJson = formData.get('ids')?.toString()
      if (idsJson) {
        const ids = JSON.parse(idsJson) as string[]
        return deleteManyEventsAction(ids)
      }
    }

    return { success: false }
  } catch (error) {
    console.error('Action error:', error)
    return { success: false }
  }
}

export function meta() {
  return [
    { title: 'Events - Dashboard' },
    { name: 'description', content: 'Manage your events' },
  ]
}

export default function EventsPage() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const submit = useSubmit()

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [deletingEvent, setDeletingEvent] = useState<TEvent | null>(null)
  const [deletingMultiple, setDeletingMultiple] = useState<TEvent[]>([])
  const _navigate = useNavigate()

  const columns = createColumn<TEvent>({
    tableName: 'events',
    columnConfig: [
      {
        type: 'text',
        accessorKey: 'id',
        header: 'ID',
        fallback: 'No ID',
      },
      {
        type: 'text',
        accessorKey: 'name',
        header: 'Name',
        fallback: 'No name',
      },
      {
        type: 'text',
        accessorKey: 'description',
        header: 'Description',
        fallback: 'No description',
      },
      {
        type: 'date',
        accessorKey: 'eventDate',
        header: 'Event Date',
      },
      {
        type: 'text',
        accessorKey: 'location',
        header: 'Location',
        fallback: 'No location',
      },
      {
        type: 'text',
        accessorKey: 'status',
        header: 'Status',
        fallback: 'No status',
      },
      {
        type: 'date',
        accessorKey: 'createdAt',
        header: 'Created',
      },
    ],
    actionColumnConfig: {
      getItemId: (event) => event.id,
      onDelete: (event) => setDeletingEvent(event),
    },
  })

  const handleSearch = (value: string) => {
    setSearchValue(value)
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    setSearchParams(params)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    setSearchParams(params)
  }

  const handleDeleteEvent = () => {
    if (!deletingEvent) return

    const formData = new FormData()
    formData.append('intent', 'delete')
    formData.append('eventId', deletingEvent.id)

    submit(formData, { method: 'post' })
    setDeletingEvent(null)
    toast.success('Event deleted')
  }

  const handleDeleteMultiple = () => {
    if (deletingMultiple.length === 0) return

    const formData = new FormData()
    formData.append('intent', 'deleteMany')
    formData.append('ids', JSON.stringify(deletingMultiple.map((e) => e.id)))

    submit(formData, { method: 'post' })
    setDeletingMultiple([])
    toast.success(`${deletingMultiple.length} event${deletingMultiple.length !== 1 ? 's' : ''} deleted`)
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        <DataTable
          data={loaderData.docs}
          columns={columns}
          searchPlaceholder="Search events..."
          searchValue={searchValue}
          onSearchChange={handleSearch}
          emptyMessage="No events found."
          enableRowSelection
          tableName="events"
          onDeleteSelected={setDeletingMultiple}
          totalPages={loaderData.totalPages}
          manualPagination
        />

        {loaderData.totalPages > 1 && (
          <TablePagination
            currentPage={loaderData.page}
            totalPages={loaderData.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <DeleteDialog
        open={!!deletingEvent}
        onOpenChange={(open) => !open && setDeletingEvent(null)}
        title="Delete Event"
        itemName={deletingEvent?.name || ''}
        onConfirm={handleDeleteEvent}
        onCancel={() => setDeletingEvent(null)}
      />

      <DeleteDialog
        open={deletingMultiple.length > 0}
        onOpenChange={(open) => !open && setDeletingMultiple([])}
        title="Delete Events"
        itemName={`${deletingMultiple.length} event${deletingMultiple.length !== 1 ? 's' : ''}`}
        onConfirm={handleDeleteMultiple}
        onCancel={() => setDeletingMultiple([])}
      />
    </div>
  )
}

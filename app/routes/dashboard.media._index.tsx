import { useState } from 'react'
import { useLoaderData, useNavigate, useSearchParams, useSubmit } from 'react-router'
import { toast } from 'sonner'
import createColumn from '~/components/admin/table/column/create-column'
import { DataTable, DeleteDialog, TablePagination } from '~/components/admin/table/table-list'
import { deleteManyMediaAction } from '~/features/media/actions/delete-many-media-action'
import { deleteMediaAction } from '~/features/media/actions/delete-media-action'
import { getMediaLoader } from '~/features/media/loaders/get-media-loader'
import type { TMedia } from '~/db/schema'
import type { Route } from './+types/dashboard.media._index'

export async function loader({ request }: Route.LoaderArgs) {
  return await getMediaLoader(request)
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  try {
    if (intent === 'delete') {
      const mediaId = formData.get('mediaId')?.toString()
      if (mediaId) {
        return deleteMediaAction(mediaId)
      }
    }

    if (intent === 'deleteMany') {
      const idsJson = formData.get('ids')?.toString()
      if (idsJson) {
        const ids = JSON.parse(idsJson) as string[]
        return deleteManyMediaAction(ids)
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
    { title: 'Media - Dashboard' },
    { name: 'description', content: 'Manage your media files' },
  ]
}

export default function DashboardMediaPage() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const submit = useSubmit()

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [deletingMedia, setDeletingMedia] = useState<TMedia | null>(null)
  const [deletingMultiple, setDeletingMultiple] = useState<TMedia[]>([])
  const _navigate = useNavigate()

  const columns = createColumn<TMedia>({
    tableName: 'media',
    columnConfig: [
      {
        type: 'text',
        accessorKey: 'id',
        header: 'ID',
        fallback: 'No ID',
      },

      {
        type: 'image',
        accessorKey: 'url',
        header: 'URL',
        fallback: 'No URL',
      },
      {
        type: 'text',
        accessorKey: 'alt',
        header: 'Alt Text',
        fallback: 'No alt text',
      },
      {
        type: 'date',
        accessorKey: 'createdAt',
        header: 'Created',
      },
      {
        type: 'date',
        accessorKey: 'updatedAt',
        header: 'Updated',
      },
    ],
    actionColumnConfig: {
      getItemId: (media) => media.id,
      onDelete: (media) => setDeletingMedia(media),
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

  const handleDeleteMedia = () => {
    if (!deletingMedia) return

    const formData = new FormData()
    formData.append('intent', 'delete')
    formData.append('mediaId', deletingMedia.id)

    submit(formData, { method: 'post' })
    setDeletingMedia(null)
    toast.success('Media deleted')
  }

  const handleDeleteMultiple = () => {
    if (deletingMultiple.length === 0) return

    const formData = new FormData()
    formData.append('intent', 'deleteMany')
    formData.append('ids', JSON.stringify(deletingMultiple.map((m) => m.id)))

    submit(formData, { method: 'post' })
    setDeletingMultiple([])
    toast.success(`${deletingMultiple.length} media file(s) deleted`)
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        <DataTable
          data={loaderData.docs}
          columns={columns}
          searchPlaceholder="Search media..."
          searchValue={searchValue}
          onSearchChange={handleSearch}
          emptyMessage="No media found."
          enableRowSelection
          tableName="media"
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
        open={!!deletingMedia}
        onOpenChange={(open) => !open && setDeletingMedia(null)}
        title="Delete Media"
        itemName={deletingMedia?.filename || ''}
        onConfirm={handleDeleteMedia}
        onCancel={() => setDeletingMedia(null)}
      />

      <DeleteDialog
        open={deletingMultiple.length > 0}
        onOpenChange={(open) => !open && setDeletingMultiple([])}
        title="Delete Media"
        itemName={`${deletingMultiple.length} media file${deletingMultiple.length !== 1 ? 's' : ''}`}
        onConfirm={handleDeleteMultiple}
        onCancel={() => setDeletingMultiple([])}
      />
    </div>
  )
}

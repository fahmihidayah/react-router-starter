import { useMemo, useState } from 'react'
import { useLoaderData, useSearchParams, useSubmit } from 'react-router'
import type { TMedia } from '~/db/schema'
import {
  DataTable,
  DeleteDialog,
  TablePagination,
} from '~/features/admin/components/table/table-list'
import { deleteManyMediaAction, deleteMediaAction } from '~/features/media/actions'
import { createMediaTableColumns } from '~/features/media/components/admin/media-table-columns'
import { getMediaLoader } from '~/features/media/loaders/get-media-loader'
import type { Route } from './+types/media._index'

export function loader({ request }: Route.LoaderArgs) {
  return getMediaLoader(request)
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'delete') {
    const id = formData.get('id')
    return typeof id === 'string'
      ? deleteMediaAction(id)
      : { success: false, message: 'Media ID is required' }
  }

  if (intent === 'deleteMany') {
    const value = formData.get('ids')
    try {
      const ids: unknown = JSON.parse(typeof value === 'string' ? value : '[]')
      return Array.isArray(ids) && ids.every((id) => typeof id === 'string')
        ? deleteManyMediaAction(ids)
        : { success: false, message: 'Invalid media IDs' }
    } catch {
      return { success: false, message: 'Invalid media IDs' }
    }
  }

  return { success: false, message: 'Invalid action' }
}

export function meta() {
  return [{ title: 'Media - Dashboard' }, { name: 'description', content: 'Manage media files' }]
}

export default function MediaPage() {
  const data = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const submit = useSubmit()
  const [deleting, setDeleting] = useState<TMedia[]>([])
  const columns = useMemo(() => createMediaTableColumns((item) => setDeleting([item])), [])

  const changePage = (page: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  const confirmDelete = () => {
    const formData = new FormData()
    formData.set('intent', deleting.length === 1 ? 'delete' : 'deleteMany')
    if (deleting.length === 1) formData.set('id', deleting[0].id)
    else formData.set('ids', JSON.stringify(deleting.map((item) => item.id)))
    submit(formData, { method: 'post' })
    setDeleting([])
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        <DataTable
          data={data.docs}
          columns={columns}
          emptyMessage="No media found."
          onDeleteSelected={setDeleting}
        />
        {data.totalPages > 1 && (
          <TablePagination
            currentPage={data.page}
            totalPages={data.totalPages}
            onPageChange={changePage}
          />
        )}
      </div>
      <DeleteDialog
        open={deleting.length > 0}
        onOpenChange={(open) => !open && setDeleting([])}
        title={deleting.length === 1 ? 'Delete media' : 'Delete media files'}
        itemName={
          deleting.length === 1
            ? deleting[0].originalFilename || deleting[0].filename
            : `${deleting.length} files`
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleting([])}
      />
    </div>
  )
}

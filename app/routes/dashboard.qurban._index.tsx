import { useState } from 'react'
import { useLoaderData, useNavigate, useSearchParams, useSubmit } from 'react-router'
import { toast } from 'sonner'
import createColumn from '~/components/admin/table/column/create-column'
import { DataTable, DeleteDialog, TablePagination } from '~/components/admin/table/table-list'
import { deleteManyQurbansAction } from '~/features/qurban/actions/delete-many-qurbans-action'
import { deleteQurbanAction } from '~/features/qurban/actions/delete-qurban-action'
import { getQurbansLoader } from '~/features/qurban/loaders/get-qurbans-loader'
import type { TQurban } from '~/db/schema'
import type { Route } from './+types/dashboard.qurban._index'

export async function loader({ request }: Route.LoaderArgs) {
  return await getQurbansLoader(request)
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  try {
    if (intent === 'delete') {
      const qurbanId = formData.get('qurbanId')?.toString()
      if (qurbanId) {
        return deleteQurbanAction(qurbanId)
      }
    }

    if (intent === 'deleteMany') {
      const idsJson = formData.get('ids')?.toString()
      if (idsJson) {
        const ids = JSON.parse(idsJson) as string[]
        return deleteManyQurbansAction(ids)
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
    { title: 'Qurban - Dashboard' },
    { name: 'description', content: 'Manage your qurban' },
  ]
}

export default function QurbanPage() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const submit = useSubmit()

  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const [deletingQurban, setDeletingQurban] = useState<TQurban | null>(null)
  const [deletingMultiple, setDeletingMultiple] = useState<TQurban[]>([])
  const _navigate = useNavigate()

  const columns = createColumn<TQurban>({
    tableName: 'qurban',
    columnConfig: [
      {
        type: 'text',
        accessorKey: 'id',
        header: 'ID',
        fallback: 'No ID',
      },
      {
        type: 'text',
        accessorKey: 'transactionId',
        header: 'Transaction ID',
        fallback: 'No transaction',
      },
      {
        type: 'text',
        accessorKey: 'animalType',
        header: 'Animal Type',
        fallback: 'No animal type',
      },
      {
        type: 'text',
        accessorKey: 'groupNumber',
        header: 'Group Number',
        fallback: 'No group number',
      },
      {
        type: 'text',
        accessorKey: 'hijriYear',
        header: 'Hijri Year',
        fallback: 'No hijri year',
      },
      {
        type: 'text',
        accessorKey: 'notes',
        header: 'Notes',
        fallback: 'No notes',
      },
      {
        type: 'date',
        accessorKey: 'createdAt',
        header: 'Created',
      },
    ],
    actionColumnConfig: {
      getItemId: (qurban) => qurban.id,
      onDelete: (qurban) => setDeletingQurban(qurban),
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

  const handleDeleteQurban = () => {
    if (!deletingQurban) return

    const formData = new FormData()
    formData.append('intent', 'delete')
    formData.append('qurbanId', deletingQurban.id)

    submit(formData, { method: 'post' })
    setDeletingQurban(null)
    toast.success('Qurban deleted')
  }

  const handleDeleteMultiple = () => {
    if (deletingMultiple.length === 0) return

    const formData = new FormData()
    formData.append('intent', 'deleteMany')
    formData.append('ids', JSON.stringify(deletingMultiple.map((q) => q.id)))

    submit(formData, { method: 'post' })
    setDeletingMultiple([])
    toast.success(`${deletingMultiple.length} qurban${deletingMultiple.length !== 1 ? 's' : ''} deleted`)
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        <DataTable
          data={loaderData.docs}
          columns={columns}
          searchPlaceholder="Search qurban..."
          searchValue={searchValue}
          onSearchChange={handleSearch}
          emptyMessage="No qurban found."
          enableRowSelection
          tableName="qurban"
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
        open={!!deletingQurban}
        onOpenChange={(open) => !open && setDeletingQurban(null)}
        title="Delete Qurban"
        itemName={deletingQurban?.id || ''}
        onConfirm={handleDeleteQurban}
        onCancel={() => setDeletingQurban(null)}
      />

      <DeleteDialog
        open={deletingMultiple.length > 0}
        onOpenChange={(open) => !open && setDeletingMultiple([])}
        title="Delete Qurban"
        itemName={`${deletingMultiple.length} qurban${deletingMultiple.length !== 1 ? 's' : ''}`}
        onConfirm={handleDeleteMultiple}
        onCancel={() => setDeletingMultiple([])}
      />
    </div>
  )
}
